#wizard input: length1
#wizard text: -period
#wizard input: averageType1
#wizard text: crosses
#wizard input: crossingType
#wizard input: length2
#wizard text: -period
#wizard input: averageType2
#wizard text: Price:
#wizard input: price

input price = volume;
input length1 = 15;
input length2 = 30;
input averageType1 = AverageType.Simple;
input averageType2 = AverageType.Simple;
input crossingType = {default above, below};

# Get average 30 day volume.
def VolAvg = Average(volume, 30);
def minVolCrossOver = VolAvg * (10 / 100);
def volTest = if volume - minVolCrossOver > VolAvg then yes else no;

# Get Price direction
def priceDirection = close - open;
def directionUp = if priceDirection < 0 then no else yes;

def volRequirement = if volTest and directionUp then yes else no;

def avg1 = MovingAverage(averageType1, price, length1);
def avg2 = MovingAverage(averageType2, price, length2);

plot signal = crosses(avg1, avg2, crossingType == CrossingType.above);

signal.DefineColor("Above", GetColor(6));
signal.DefineColor("Below", GetColor(7));
signal.AssignValueColor(if crossingType == CrossingType.above then signal.color("Above") else signal.color("Below"));

signal.SetPaintingStrategy(if (volRequirement == yes)
    then PaintingStrategy.BOOLEAN_ARROW_UP
    else PaintingStrategy.BOOLEAN_ARROW_DOWN);
