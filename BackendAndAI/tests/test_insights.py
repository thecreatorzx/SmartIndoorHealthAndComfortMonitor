import pytest
from app.routers.insights import calculate_comfort


def test_noise_scores():
    # noise well below base -> full score
    r = {"temperature":24, "humidity":45, "co2":800, "noise":30}
    out = calculate_comfort(r)
    assert out["comfort_score"] <= 100
    
    # noise moderate
    r["noise"] = 50
    out = calculate_comfort(r)
    # expected approx: base 100, penalty (50-40)*1.5 = 15 => noise_score ~85
    assert out["comfort_score"] > 70
    
    # noise at threshold
    r["noise"] = 65
    out = calculate_comfort(r)
    # noise_score at threshold should be lower than the previous
    assert out["comfort_score"] < 90
    
    # noise well above threshold
    r["noise"] = 85
    out = calculate_comfort(r)
    # should significantly reduce comfort score
    assert out["comfort_score"] < 50


if __name__ == "__main__":
    pytest.main(["-q"])