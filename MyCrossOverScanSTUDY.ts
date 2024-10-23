# MyCrossOverScan

# Inputs
Input fastLength = 5;
input slowLength = 10;
input stopLength = 21;
input averageVolLength = 30;
input minimumPercentVolCrossover = 10;

# Plot three moving averages.
plot FastSMA = MovingAverage(AverageType.EXPONENTIAL, close, fastLength);
plot SlowSMA = MovingAverage(AverageType.EXPONENTIAL, close, slowLength);
plot StopSMA = MovingAverage(AverageType.EXPONENTIAL, close, stopLength);

FastSMA.SetDefaultColor(CreateColor(0,255,0));
SlowSMA.SetDefaultColor(CreateColor(0,0,255));
StopSMA.SetDefaultColor(Createcolor(255,0,0));

# Get Price direction.above
def priceDirection = close - open;
def closeTest = if close > close[1] then Yes else No;

# Get average 30 day volume.
def VolAvg = Average(volume, averageVolLength);
def minVolCrossOver = VolAvg * (minimumPercentVolCrossover / 100);

# Indicator 1:
def directionUp = if priceDirection > 0 && closeTest then No else Yes;

# Indicator 2:
def crossOver = if FastSMA crosses above StopSMA then Yes else No;

# Indicator 3:
def VolTest = if volume - minVolCrossOver > VolAvg then Yes else No;

