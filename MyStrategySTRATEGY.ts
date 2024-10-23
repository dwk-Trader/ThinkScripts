#
# TD Ameritrade IP Company, Inc. (c) 2013-2021
#
# Each buy or sell condition stands independent thus any single true buy or sell condition
# among all the conditions will initiate the buy/sell order.

input totalInvestment = 315000.00;
input maxPercent = 10;
input price = close;
input fastLength = 10;
input slowLength = 10;
input stopLength = 20;
input averageTypeFast = AverageType.EXPONENTIAL;
input averageTypeSlow = AverageType.SIMPLE;
input averageTypeStop = AverageType.SIMPLE;
input AverageVolLength = 30;
input minimumPercentVolCrossover = 20;
#input minimumPercentPriceCrossunder = 10;
input sellbubble = No;
input buybubble = No;

# Get average 50 day volume.
def VolAvg = Average(volume, averageVolLength);
def minVolCrossOver = VolAvg * (minimumPercentVolCrossover / 100);
def volTest = if volume - VolAvg > minVolCrossOver and close > open then Yes else No;


# Calculate max purchase size.
def maxInvestment = totalInvestment * (maxPercent / 100);
def maxShareSize = RoundDown(maxInvestment / price, 0);
def purchasePrice = hl2[-1];

def avgBodyHeight = Average(BodyHeight(), 10);
def curBH = BodyHeight();

# Plot three moving averages.
plot FastSMA = MovingAverage(averageTypeFast, price, fastLength);
plot SlowSMA = MovingAverage(averageTypeSlow, price, slowLength);
plot StopSMA = MovingAverage(averageTypeStop, price, stopLength);

FastSMA.SetDefaultColor(CreateColor(0,255,0));
SlowSMA.SetDefaultColor(CreateColor(0,0,255));
StopSMA.SetDefaultColor(Createcolor(255,0,0));

def trendDown = IsDescending(close, 3);

# The primary reason for buy condition is the volumn crossing up over the moving 50 day
# moving average and close is above open. Each buy condition starts with this premise.

def primaryBuy = if volTest then yes else no;

# =============== Buy Conditions =======================
# Define sub condition A to Buy if close is above open 
# and Volume is more than minimum percent above 50 day average,
def cA1Buy = if primaryBuy then Yes else No;
def cA2Buy = if FastSMA > StopSMA then Yes else No;
def cA3Buy = if open[-1] < close then No else Yes;
def cBuyA = if cA1Buy && cA2Buy && cA3Buy then yes else no;





# Set the condition to buy if any subconditions are true.
def cBuy = if cBuyA then yes else no;

# ====================== End Buy Conditions ==============================

# ====================== Sell Conditions =================================
# Define sub condition A to Sell if close is less than StopMA
def cA1Sell = if cBuy then No else Yes;
def cA2Sell = if close[-1] < StopSMA then yes else no;
def cSellA = if cA1Sell && cA2Sell then yes else no;

# Define subCondition B to Sell if close is less than SlowSMA
def cB1Sell = if cBuy then No else Yes;
def cB2Sell = if close[-1] < SlowSMA then Yes else No;
def cSellB = if cB1Sell && cB2Sell then Yes else No;

# Set the the condition to sell if any subconditions are true.
def cSell = if cSellA or cSellB then yes else no;

# =========================== End Sell Conditions ======================================

# Set up Chart Bubbles to aid in Debugging Script.
AddChartBubble(buybubble, low, "BuyA: " + cBuyA, Color.GREEN, no);
AddChartBubble(sellbubble, high, "Trend: " + trendDown + "\nAvgB: " + avgBodyHeight + "\nBH: " + curBH + "\nSellA1: " + cA1Sell + "\nSellA2: " + cA1Sell, Color.YELLOW, no);

# Buy/Sell Orders
AddOrder(OrderType.BUY_TO_OPEN, cBuy, purchasePrice, maxShareSize, tickcolor = GetColor(1), arrowcolor = GetColor(6));
AddOrder(OrderType.SELL_TO_CLOSE, cSell, purchasePrice, maxShareSize, tickcolor = GetColor(2), arrowcolor = GetColor(5));
