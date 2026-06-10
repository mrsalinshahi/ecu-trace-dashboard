"""
Rule definitions for ECU signal validation.
Each rule specifies valid value ranges and max allowed gap (ms) between samples.
"""

from dataclasses import dataclass

SIGNAL_RULES: dict[str, "SignalRule"] = {}


@dataclass
class SignalRule:
    signal_name: str
    min_value: float | None = None
    max_value: float | None = None
    max_gap_ms: float | None = None  # max silence gap before "missing signal" warning
    unit: str = ""


def _reg(rule: SignalRule) -> SignalRule:
    SIGNAL_RULES[rule.signal_name] = rule
    return rule


# Automotive ECU signal rules (representative subset)
_reg(SignalRule("EngineRPM",        min_value=0,    max_value=8000,  max_gap_ms=50,  unit="rpm"))
_reg(SignalRule("VehicleSpeed",     min_value=0,    max_value=300,   max_gap_ms=100, unit="km/h"))
_reg(SignalRule("CoolantTemp",      min_value=-40,  max_value=130,   max_gap_ms=500, unit="°C"))
_reg(SignalRule("BatteryVoltage",   min_value=9.0,  max_value=16.0,  max_gap_ms=200, unit="V"))
_reg(SignalRule("ThrottlePos",      min_value=0,    max_value=100,   max_gap_ms=20,  unit="%"))
_reg(SignalRule("BrakePressure",    min_value=0,    max_value=200,   max_gap_ms=20,  unit="bar"))
_reg(SignalRule("FuelPressure",     min_value=2.0,  max_value=8.0,   max_gap_ms=100, unit="bar"))
_reg(SignalRule("IntakeAirTemp",    min_value=-40,  max_value=80,    max_gap_ms=500, unit="°C"))
_reg(SignalRule("MAP",              min_value=10,   max_value=300,   max_gap_ms=50,  unit="kPa"))
_reg(SignalRule("LambdaSensor",     min_value=0.5,  max_value=1.5,   max_gap_ms=50,  unit="λ"))
_reg(SignalRule("SteeringAngle",    min_value=-720, max_value=720,   max_gap_ms=20,  unit="°"))
_reg(SignalRule("YawRate",          min_value=-300, max_value=300,   max_gap_ms=20,  unit="°/s"))
_reg(SignalRule("AccelPedalPos",    min_value=0,    max_value=100,   max_gap_ms=20,  unit="%"))
_reg(SignalRule("OilPressure",      min_value=0.5,  max_value=10.0,  max_gap_ms=200, unit="bar"))
_reg(SignalRule("TransmissionTemp", min_value=-40,  max_value=160,   max_gap_ms=500, unit="°C"))
