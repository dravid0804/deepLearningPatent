"""Run all currently data-backed ANT-EV baseline trainers.

M1 and M2 consume the prepared datasets. M3–M6 are deliberately excluded:
their existing scripts are demo generators, not trainers that consume a real
prepared dataset. This prevents a misleading 'all trained' result.
"""
from train_energy_model import train_m1_energy_model
from train_demand_model import train_m2_demand_model


def export_all():
    print("\nANT-EV baseline training run\n")
    train_m1_energy_model()
    train_m2_demand_model()
    print("\nCompleted: M1 and M2 trained from prepared downloaded datasets.")
    print("Not run: M3–M6 need data-backed trainer implementations before they can be trained honestly.")


if __name__ == "__main__":
    export_all()
