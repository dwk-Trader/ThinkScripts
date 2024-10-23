#
# TD Ameritrade IP Company, Inc. (c) 2013-2021
#
# Each buy or sell condition stands independent thus any single true buy or sell condition
# among all the conditions will initiate the buy/sell order.

input totalInvestment = 310000.00;
input maxPercent = 10;
input fastLength = 10;
input slowLength = 10;
input stopLength = 20;
input averageTypeFast = AverageType.EXPONENTIAL;
input averageTypeSlow = AverageType.SIMPLE;
input averageTypeStop = AverageType.SIMPLE;
input AverageVolLength = 30;
input minimumPercentVolCrossover = 10;
input maxDropPercent = 10;
input buyBubble = no;
input sellBubble = no;

# Get average 30 day volume.
def VolAvg = Average(volume, AverageVolLength);
def minVolCrossOver = VolAvg * (minimumPercentVolCrossover / 100);
def volTest = if volume - minVolCrossOver > VolAvg then yes else no;

# Get Price direction
def priceDirection = close - open;
def directionUp = if priceDirection > 0 then yes else no;
def directionDown = if priceDirection < 0 then yes else no;

def volRequirement = if volTest and directionUp then yes else no;

# Calculate max purchase size.
def maxInvestment = totalInvestment * (maxPercent / 100);
def maxShareSize = RoundDown(maxInvestment / close, 0);
def purchasePrice = hl2[-1];

# Plot three moving averages.
plot FastMA = MovingAverage(averageTypeFast, close, fastLength);
plot SlowMA = MovingAverage(averageTypeSlow, close, slowLength);
plot StopMA = MovingAverage(averageTypeStop, close, stopLength);

# Set the colors of the three moving averages.
FastMA.SetDefaultColor(CreateColor(0, 255, 0));
SlowMA.SetDefaultColor(CreateColor(255, 255, 0));
StopMA.SetDefaultColor(CreateColor(255, 0, 0));

# The primary buy condition is the FastSMA crossing
# up over the StopSMA.
# Each buy condition starts with one of these indicators.
def buyIndicator1 = if FastMA crosses above StopMA && volRequirement then yes else no;
def buyIndicator2 = if FastMA crosses above SlowMA && open > FastMA && volRequirement then yes else no;
def subInd1 = if close > FastMA && close > SlowMA && close > StopMA then yes else no;
def subInd2 = if open < FastMA && open < SlowMA && open < StopMA then yes else no;
def subInd3 = if open > FastMA && open > SlowMA && open > StopMA && directionUp then yes else no;
def buyIndicator3 = if subInd1 && subInd2 && volRequirement then yes else no;
def buyIndicator4 = if volume > VolAvg * 2 && directionUp && volRequirement then yes else no;
def buyIndicator5 = if subInd3 && volume > VolAvg then yes else no;
def buyIndicator = if buyIndicator1 or buyIndicator2 or buyIndicator3 or buyIndicator4 or buyIndicator5 then yes else no;

# =============== Buy Indicator 1 =======================
# Define sub condition A to Buy if close is above open 
# and Volume is more than minimum percent above 50 day average,
def cA1Buy = if buyIndicator then yes else no;
def cA2Buy = if close[-1] < open then no else Yes;

# def cBuyA = Set the condition to buy if all conditions are yes;
def cBuy = cA1Buy && cA2Buy;

plot ArrowUp =  if buyIndicator && cBuy then yes else no;
ArrowUp.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);

# ====================== End Buy Conditions =========================
# ====================== Sell Conditions ============================
# Define sub condition A
def cA1Sell = if cBuy then no else yes;
def cA2Sell = if (close[-1] < StopMA) then yes else no;
def cSellA = if cA1Sell && cA2Sell && cA2Sell then yes else no;

# Define sub condition B
def cB1Sell = if cBuy then no else yes;
def cB2Sell = if close[-1] < FastMA && close[-1] < SlowMA && volume > VolAvg && directionDown then yes else no;
def cSellB = if cB1Sell && cB2Sell then yes else no;

# Define sub condition C
def cC1Sell = if cBuy then no else yes;
def cC2Sell = if close < close[1] && close > close[-1] then yes else no;
def cSellC = if cC1Sell && cC2Sell then yes else no;

# Set the the condition to sell if any subconditions are true.
def cSell = if cSellA or cSellB then yes else no;

# ======================End Sell Conditions =========================

# BuyBubble Bubble
def showBuyBubble = if buyBubble && cBuy then yes else no;
AddChartBubble(showbuyBubble, low - 5, "Direction: " + buyIndicator1 + "\nA1Buy: " + cA1Buy + "\nA2Buy: " + cA2Buy, Color.GREEN, no);

# Sell Bubble
def showSellBubble = if sellBubble && cSell then yes else no;
AddChartBubble(showSellBubble, high + 5, "BuyA: " + cBuy + "\nSellA: " + cSellA + "\nClose[1]: " + close[1] + "\nClose: " + close+ "\nClose[-1]: " + close[-1] + "\nStopSMA: " + StopMA + "\nFastSMA: " + FastMA + "\nSlowSMA: " + SlowMA, Color.YELLOW, no);

# Buy/Sell Orders
AddOrder(OrderType.BUY_TO_OPEN, cBuy, purchasePrice, maxShareSize, tickcolor = GetColor(1), arrowcolor = GetColor(6));
AddOrder(OrderType.SELL_TO_CLOSE, cSell, hl2, maxShareSize, tickcolor = GetColor(2), arrowcolor = GetColor(5));
