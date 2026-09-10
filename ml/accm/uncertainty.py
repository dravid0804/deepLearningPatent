"""
Heteroscedastic Uncertainty Estimation for ACCM.
Outputs mean (mu) and log-variance (log_var = log(sigma^2)) for each continuous prediction,
with Gaussian Negative Log-Likelihood loss and confidence score calibration.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F

class HeteroscedasticHead(nn.Module):
    """
    Decodes latent features into predictive distribution parameters:
    mean (mu) and log-variance (s = log(sigma^2)).
    """
    def __init__(self, in_features: int, num_targets: int):
        super().__init__()
        self.mean_layer = nn.Linear(in_features, num_targets)
        self.logvar_layer = nn.Linear(in_features, num_targets)

        # Initialize log-variance to produce moderate initial uncertainty (~0.1 to 0.5)
        nn.init.constant_(self.logvar_layer.bias, -1.0)

    def forward(self, x: torch.Tensor):
        """
        Args:
            x: [..., in_features]
        Returns:
            mean: [..., num_targets]
            log_var: [..., num_targets]
            std: [..., num_targets]
        """
        mean = self.mean_layer(x)
        # Clamp log-variance to prevent numerical explosion or collapse
        log_var = torch.clamp(self.logvar_layer(x), min=-6.0, max=4.0)
        std = torch.exp(0.5 * log_var)
        return mean, log_var, std


def gaussian_nll_loss(y_true: torch.Tensor, mean: torch.Tensor, log_var: torch.Tensor, mask: torch.Tensor = None) -> torch.Tensor:
    """
    Computes heteroscedastic Gaussian Negative Log-Likelihood loss:
    L = 0.5 * exp(-log_var) * (y_true - mean)^2 + 0.5 * log_var
    """
    precision = torch.exp(-log_var)
    loss = 0.5 * precision * (y_true - mean) ** 2 + 0.5 * log_var
    if mask is not None:
        loss = loss * mask
        return loss.sum() / (mask.sum() + 1e-8)
    return loss.mean()


def calculate_confidence_score(std: torch.Tensor, reference_stds: torch.Tensor = None) -> torch.Tensor:
    """
    Converts predictive standard deviation into a percentage confidence score (0 - 100%).
    Lower variance yields higher confidence.
    """
    # Normalized scaling: std -> confidence via sigmoid decay
    # confidence = 100 / (1 + 2 * std)
    confidence = 100.0 / (1.0 + 2.0 * std)
    return torch.clamp(confidence, min=10.0, max=99.0)
