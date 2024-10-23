#
# TD Ameritrade IP Company, Inc. (c) 2013-2021
#
# Each buy or sell condition stands independent thus any single true buy or sell condition
# among all the conditions will initiate the buy/sell order.

input totalInvestment = 315000.00;
input maxPercent = 10;
input fastLength = 10;
input slowLength = 10;
input stopLength = 20;
input averageTypeFast = AverageType.EXPONENTIAL;
input averageTypeSlow = AverageType.SIMPLE;
input averageTypeStop = AverageType.SIMPLE;
input AverageVolLength = 30;
input minimumPercentVolCrossover = 20;
input buyBubble = no;
input sellBubble = no;

# Get average 30 day volume.
def VolAvg = Average(volume, AverageVolLength);
def minVolCrossOver = VolAvg * (minimumPercentVolCrossover / 100);
def volTest = if volume - minVolCrossOver > VolAvg then yes else no;

# Get Price direction
def priceDirection = close - open;
def directionUp = if priceDirection < 0 then no else yes;

def volRequirement = if volTest and directionUp then yes else no;

# Calculate max purchase size.
def maxInvestment = totalInvestment * (maxPercent / 100);
def maxShareSize = RoundDown(maxInvestment / close, 0);
def purchasePrice = hl2[-1];

# Plot three moving averages.
plot FastSMA = MovingAverage(averageTypeFast, close, fastLength);
plot SlowSMA = MovingAverage(averageTypeSlow, close, slowLength);
plot StopSMA = MovingAverage(averageTypeStop, close, stopLength);

FastSMA.SetDefaultColor(CreateColor(0, 255, 0));
SlowSMA.SetDefaultColor(CreateColor(0, 0, 255));
StopSMA.SetDefaultColor(CreateColor(255, 0, 0));

# The primary buy condition is the volumn crossing
# up over the moving 50 day and price movement is up.
# Each buy condition starts with this premise.
def primaryBuy = if volRequirement && directionUp then yes else no;

# =============== Buy Conditions =======================
# Define sub condition A to Buy if close is above open 
# and Volume is more than minimum percent above 50 day average,
def cA1Buy = if primaryBuy then yes else no;
def cA2Buy = if close[-1] < close then no else Yes;
def cA3Buy = if (!directionUp[-1] && (open[-1] - close[-1])< .5) or (directionUp[-1]) or (!directionUp[-1] and close[-1] > hl2) then yes else no;

# def cBuyA = Set the condition to buy if all conditions are yes;
def cBuyA = cA1Buy && cA2Buy && cA3Buy;


# ====================== End Buy Conditions =========================
# ====================== Sell Conditions ============================
# Define sub condition A
def cA1Sell = if cBuyA then no else yes;
def cA2Sell = if (close[-1] < StopSMA) or (close[-1] < FastSMA) or (close[-1] < SlowSMA) then yes else no;
def cA3Sell = if close < close[1] then yes else no;
def cSellA = if cA1Sell && cA2Sell && cA3Sell then yes else no;

# Define subCondition B
def cB1Sell = if cBuyA then no else yes;
def cB2Sell = if close[-1] < close then yes else no;
def cB3Sell = if close[1] > close then yes else no;
def cB4Sell = if !directionUp and !directionUp[-1] then yes else no;
def cSellB = if cB1Sell && cB2Sell && cB3Sell && cB4Sell then yes else no;


# Set the the condition to sell if any subconditions are true.
def cSell = if cSellA or cSellB then yes else no;

# ======================End Sell Conditions =========================

# BuyBubble Bubble
AddChartBubble(buybubble, low - 5, "Direction: " + primaryBuy + "\nA1Buy: " + cA1Buy + "\nA2Buy: " + cA2Buy + "\nA3Buy: " + cA3Buy, Color.GREEN, no);

# Sell Bubble
AddChartBubble(sellbubble, high + 5, "BuyA: " + cBuyA + "\nSellA: " + cSellA + "\ncSellB: " + cSellB + "\nClose[1]: " + close[1] + "\nClose: " + close+ "\nClose[-1]: " + close[-1] + "\nStopSMA: " + StopSMA + "\nFastSMA: " + FastSMA + "\nSlowSMA: " + SlowSMA, Color.YELLOW, no);

# Buy/Sell Orders
AddOrder(OrderType.BUY_TO_OPEN, cBuyA, purchasePrice, maxShareSize, tickcolor = GetColor(1), arrowcolor = GetColor(6));
AddOrder(OrderType.SELL_TO_CLOSE, cSell, hl2, maxShareSize, tickcolor = GetColor(2), arrowcolor = GetColor(5));
