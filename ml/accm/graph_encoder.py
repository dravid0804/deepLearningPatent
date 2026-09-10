"""
Relational Graph Encoder for ACCM.
Models the EV charging ecosystem as a heterogeneous graph:
Nodes: EV, Battery, Charger, Station, Grid, Renewable Source.
Edges: Energy flow, physical coupling, grid dependence, renewable routing.
Produces Z_G in R^128 via multi-head graph attention and global attention pooling.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F

class GraphAttentionLayer(nn.Module):
    """
    Multi-Head Graph Attention Layer with relational edge biasing.
    """
    def __init__(self, in_dim: int, out_dim: int, num_heads: int = 4, dropout: float = 0.10):
        super().__init__()
        self.num_heads = num_heads
        self.out_dim = out_dim
        self.head_dim = out_dim // num_heads

        self.W_node = nn.Linear(in_dim, out_dim, bias=False)
        self.W_edge = nn.Linear(in_dim, out_dim, bias=False)
        self.attn_src = nn.Parameter(torch.zeros(1, num_heads, 1, self.head_dim))
        self.attn_dst = nn.Parameter(torch.zeros(1, num_heads, 1, self.head_dim))
        self.leaky_relu = nn.LeakyReLU(0.2)
        self.dropout = nn.Dropout(dropout)
        self.norm = nn.LayerNorm(out_dim)

        nn.init.xavier_uniform_(self.attn_src)
        nn.init.xavier_uniform_(self.attn_dst)

    def forward(self, nodes: torch.Tensor, adj_mask: torch.Tensor) -> torch.Tensor:
        """
        Args:
            nodes: [batch, num_nodes, in_dim]
            adj_mask: [batch, num_nodes, num_nodes] (1 if connected, 0 otherwise)
        Returns:
            out: [batch, num_nodes, out_dim]
        """
        batch, num_nodes, _ = nodes.shape
        h = self.W_node(nodes).view(batch, num_nodes, self.num_heads, self.head_dim).transpose(1, 2)
        # h: [batch, num_heads, num_nodes, head_dim]

        # Compute attention scores: e_ij = a_src^T h_i + a_dst^T h_j
        scores_src = (h * self.attn_src).sum(dim=-1, keepdim=True)  # [batch, num_heads, num_nodes, 1]
        scores_dst = (h * self.attn_dst).sum(dim=-1, keepdim=True)  # [batch, num_heads, num_nodes, 1]
        attn_logits = self.leaky_relu(scores_src + scores_dst.transpose(-2, -1))
        # [batch, num_heads, num_nodes, num_nodes]

        # Mask non-connected edges
        mask = adj_mask.unsqueeze(1).expand(-1, self.num_heads, -1, -1)
        attn_logits = attn_logits.masked_fill(mask == 0, -1e9)
        attn_weights = F.softmax(attn_logits, dim=-1)
        attn_weights = self.dropout(attn_weights)

        # Message passing aggregation
        out = torch.matmul(attn_weights, h)  # [batch, num_heads, num_nodes, head_dim]
        out = out.transpose(1, 2).contiguous().view(batch, num_nodes, self.out_dim)
        return self.norm(out)


class RelationalGraphEncoder(nn.Module):
    """
    Complete Graph Encoder for ACCM producing Z_G in R^128.
    """
    def __init__(
        self,
        node_feature_dim: int = 16,
        d_model: int = 128,
        num_layers: int = 2,
        num_heads: int = 4,
        dropout: float = 0.10
    ):
        super().__init__()
        self.num_nodes = 6  # EV, Battery, Charger, Station, Grid, Renewable Source
        self.node_embed = nn.Embedding(self.num_nodes, d_model)
        self.node_proj = nn.Linear(node_feature_dim, d_model)

        self.gat_layers = nn.ModuleList([
            GraphAttentionLayer(d_model, d_model, num_heads=num_heads, dropout=dropout)
            for _ in range(num_layers)
        ])

        # Global Attention Pooling
        self.pooling_gate = nn.Linear(d_model, 1)
        self.final_norm = nn.LayerNorm(d_model)

        # Standard physical coupling adjacency template:
        # 0: EV <-> 1: Battery <-> 2: Charger <-> 3: Station <-> 4: Grid, 3: Station <-> 5: Renewable
        default_adj = torch.tensor([
            [1, 1, 1, 1, 0, 0],  # EV connects to Battery, Charger, Station
            [1, 1, 1, 0, 0, 0],  # Battery connects to EV, Charger
            [1, 1, 1, 1, 0, 0],  # Charger connects to EV, Battery, Station
            [1, 0, 1, 1, 1, 1],  # Station connects to Charger, Grid, Renewable
            [0, 0, 0, 1, 1, 1],  # Grid connects to Station, Renewable
            [0, 0, 0, 1, 1, 1],  # Renewable connects to Station, Grid
        ], dtype=torch.float32)
        self.register_buffer("default_adj", default_adj)

    def forward(self, node_features: torch.Tensor, adj_mask: torch.Tensor = None) -> torch.Tensor:
        """
        Args:
            node_features: [batch, num_nodes, node_feature_dim]
            adj_mask: Optional [batch, num_nodes, num_nodes]
        Returns:
            z_g: [batch, d_model] (Z_G in R^128)
        """
        batch = node_features.shape[0]
        node_ids = torch.arange(self.num_nodes, device=node_features.device).unsqueeze(0).expand(batch, -1)
        embeddings = self.node_embed(node_ids)  # [batch, num_nodes, d_model]
        h = self.node_proj(node_features) + embeddings

        if adj_mask is None:
            adj_mask = self.default_adj.unsqueeze(0).expand(batch, -1, -1)

        for layer in self.gat_layers:
            h = h + layer(h, adj_mask)

        # Global attention pooling
        pool_weights = F.softmax(self.pooling_gate(h), dim=1)  # [batch, num_nodes, 1]
        z_g = torch.sum(h * pool_weights, dim=1)               # [batch, d_model]
        return self.final_norm(z_g)
