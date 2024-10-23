input totalInvestment = 310000.00;
input maxPercent = 10;
input fastLength = 12;
input slowLength = 26;
input macdLength = 9;
input averageType = AverageType.EXPONENTIAL;

def diff = reference MACD(fastLength, slowLength, macdLength, averageType).Diff;

# Calculate max purchase size.
def maxInvestment = totalInvestment * (maxPercent / 100);
def maxShareSize = RoundDown(maxInvestment / close, 0);
def purchasePrice = hl2[-1];

AddOrder(OrderType.BUY_TO_OPEN, diff crosses above 0, purchasePrice, maxShareSize,tickColor = GetColor(0), arrowColor = GetColor(0), name = "MACDStratLE");
AddOrder(OrderType.SELL_TO_CLOSE, diff crosses below 0, hl2, maxShareSize,tickColor = GetColor(1), arrowColor = GetColor(1), name = "MACDStratSE");

