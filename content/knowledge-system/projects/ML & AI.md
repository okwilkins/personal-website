Zettelcasten Index: 20230215230508
Sequence:
Status: #slip-box
Zettelcasten Tags: [Data Science](../map-of-content/Data%20Science.md), *Machine Learning*
Katex: true
TOC: true

---

General Linear Models

* [x] https://www.youtube.com/watch?v=nk2CQITm_eo
* [ ] https://www.youtube.com/watch?v=zITIFTsivN8
* [ ] https://www.youtube.com/watch?v=NF5_btOaCig (Linear Models for T-Tests and ANOVA)
* [ ] https://youtu.be/2UYx-qjJGSs

Least Squares Linear Regression

* [x] https://www.youtube.com/watch?v=PaFPbb66DxQ

Odds and Log(Odds)

* [x] https://www.youtube.com/watch?v=ARfXDSkQf1Y
  https://www.youtube.com/watch?v=8nm0G-1uJzA

Maximum Likelihood

* [x] https://www.youtube.com/watch?v=XepXtl9YKwc

Logistic Regression

* [x] https://www.youtube.com/watch?v=yIYKR4sgzI8
* [ ] https://www.youtube.com/watch?v=vN5cNN2-HW
* [ ] https://www.youtube.com/watch?v=BfKanl1aSG0

Decision Trees

* [x] https://www.youtube.com/watch?v=\_L39rN6gz7
* [x] https://www.youtube.com/watch?v=g9c66TUylZ4
* [x] https://www.youtube.com/watch?v=D0efHEJsfHo

Random Forests

* [x] https://www.youtube.com/watch?v=J4Wdy0Wc_xQ

AdaBoost

* [x] https://www.youtube.com/watch?v=LsK-xG1cLYA

Gradient Boosting

* [x] https://www.youtube.com/watch?v=3CC4N4z3GJ
* [x] https://www.youtube.com/watch?v=2xudPOBz-vs
* [ ] https://www.youtube.com/watch?v=jxuNLH5dXCs
* [ ] https://www.youtube.com/watch?v=StWY5QWMXCw

Regularization

* [x] https://www.youtube.com/watch?v=Q81RR3yKn30
* [x] https://www.youtube.com/watch?v=NGf0voTMlcs

XGBoost

* [x] https://www.youtube.com/watch?v=OtD8wVaFm6E
* [ ] https://www.youtube.com/watch?v=8b1JEDvenQU
* [ ] https://www.youtube.com/watch?v=ZVFeW798-2I
* [ ] https://www.youtube.com/watch?v=oRrKeUCEb

# Regression Trees

* use when you cant fit straight line to data
* to work out output of leaf, just get avg of the values that sit in the leaf
* building root:
  * dosage \< 3 -- 3 is avg of two values
  * get avg of vals of \< 3 and >= 3 (0 & 38.8)
    * so tree will say: "Dosage \< 3? If so, then 0, else 38.8."
  * use sum of square residuals of all points (left and right) in the leaves to get qual of preds
  * THEN, go to next two points e.g. "dosage \< 5"
  * Select smallest sum of squared residuals
    * root = "dosage \< 14.5?"
  * You then for the left and right branch can do the same again on the samller subset of values
  * you then need to do this for the other features in data
  * compare SSR for each feature that makes the root node
  * to the branch down, you just do the same as before but it's filtered on e.g. "Age > 50"

# How to Prune Regression Trees

* there are several methods of prunin
  * this is on **Cost Complexity Pruning** or **Weakest Link Pruning**

use this for overfitting and variance
let say we have test/train data and the model is overfit to test data

* one way to reduce overfitting is by reducing the number of leaves
  * replace the split with a leaf that is avg of a larger num of observations
    * e.g. remove two leaves of branch and replace branch by leaf
* now the sub-tree does better at predicting test data but worse at train

how do we decide which sub-tree to use???

* first tep of cost complex pruning is to calc SSR of each pruned sub-tree for trian data
  
  * calc SSR for each leaf
  * then add up all SSR for all leaves
* each time a branch/leaf is removed, the SSR for the sub-tree will get bigger
  
  * not a suprise tho ofc
* how comapre trees?
  
  * CCP based on:
    * tree score = SSR + alpha (tree complexity pen, find using cross validation) * T (num of leaves or terminal nodes)
    * do this for all sub-trees
    * pick lowest tree score sub-tree
* how to build pruned regression tree?
  
  * first use ALL data build full sized reg tree
  * now increase alpha till the sub-tree with one branch removed, gives lower tree score compared to full sized tree
  * keep doing this with smaller and smaller sub-trees
    * recording alpha values for each
  * in the end, different vals for alpha give use a sequence of tree from full sized to just a leaf
    * e.g. 0, 10k, 15k, 22k
  * now divide into train and test
    * using just train data, use the alpha values we found on full tree and a sequaence of subtrees that min the tree score
    * now calc SSR of each new tree for test data and pick alpha based off lowest SSR
  * repeat using cross-validation
    * pick alpha that on avg gave lowest SSR with the testing data in each cross fold

# Random Forests

Step 1: Create a "**bootstrapped**" dataset

* Randomly sample dataset so that we have same size as orginal dataset
  * can pick same sample more than once

Step 2: Create decision tree using boostrapped dataset but only use a random subset of features at each step

* e.g. only consider 2 cols at each step

* there can be an optimal num of cols

* once root has been determined out of 2 cols, remove that col from data to focus on ALL of the remaining cols

* for next branch, randomly select 2 cols of the remaining cols
  
  * in the next levels of branches, you can select the col that was removed for the parent node

Now go back to step 1 and repeat bootstrap and build tree again

How to use forest?

* all trees vote and pick answer based off all the trees, 5 Trues and 1 False = True classification

**B**oostrapping the data plus the **agg**regate to make a decision is called **Bagging**

We can have **Out-Of-Bag-Dataset**, which are all the samples that did not make it into the bootstrapped data

* typically 1/3 of og data doesn't make it
* run data through tree and check if it estimate correct
* do this out-of-bag sample through all of the other trees that were built without it
* do the same thing for all of the other out of bag samples for all of the trees

The proportion of out-of-bag samples that were incorrectly calssifies is the **Out-Of-Bag Error**

To tune the number of cols selected for each step, use **Out-of-bag error**

# Adaboost

Trees are usually just a root and two leaves

* This is called a stump
* They are not great at making accurate classifications
* "*weak learners*"

In a forest of stumps, some stumps get more say in final classification than others

* this is in contrast with RF

Order is important

* The error that the first stump makes, influences how the second stump is made, etc etc
* In RF the trees are independently generated

First give each row in dataset a sample weight

* To begin with, this will be 1 / N

Then create root node in the same way as a decision tree

The the **total error** will determine the **amount of say** a stump has:

* amount of say = 0.5 * log((1 - total error) / total error)
* if total error = 0.5, say = 0
* if total error apporaches -1 (you would just do opposite of what tree says) or 1, say increases
* if total error = 1, the equation freaks out (log(0)), so a small error term is added to correct for this

To update the rows that the stump incorrectly guesses:

* new sample weight = sample weight * e ^ (amount of say)
* So if stump has a lot of say and gets guess wrong, sample weight will drastically increase

If the stump gets the guess correct, update the sample weight:

* new sample weight = sample weight * e ^ -(amount of say)
* if amount of say is large, then the row weight will go down a lot

After all weights have been updated, you need to nomalise the weights so that they add up to 1

* do this by dividing each weight by the sum of the weights

In theory, the new sample weights could be used to calc a weighted gini index for a new tree

In practice, you generate rng nums between 0 and 1, selecting the row that it falls on base don the cum sample weights

Do this as many times as you want!

How do the trees make predicition?

* Add up the amount of say of each True and False preds
* The one with more total say will be the pred

# Least Squares Linear Regression

1. Draw line through data
1. Sum pred - obvs for all points
   1. Square each term in sum to negatate large obvs vs pred
   1. This is **sum of squared residuals**

$y = ax + b$ 
We want to find the optimal vaues for a and b so that the sum of squared residuals is minimised
Since we want the line that will give us the smallest sum of squares, this is called ***least squares*** 

Plot graph of roration of line vs SSR and take derivative of the function
Best point is where the derivative is 0

# Linear Regression

Main ideas:

1. Use least-squares to fit a line to the data
1. Calculate $R^2$
1. Calculate a p-value for $R^2$

Look above for notes on least-squares

$R^2$:
Example:

* First shift all data to y-axis
  * We are only interested in y-axis feature
* Then calculate avg. y data
  * Sum the squared resdiduals
  * We call this SS(mean) -> "sum of squares around the mean"
    * SS(mean) = (data - mean)^2
  * Variation around the mean = (data - mean) ^ 2 / n
    * Var(mean) = SS(mean) / n
    * We can think of variance as the average sum of squares per e.g. "mouse"

Now apply this to the line of best fit:

* SS(fit) = (data - line) ^ 2
* Var(fit) = SS(fit) / n
* Can think of Var(fit) as the avg SS(fit) for each mouse

In general: Variance(something) = sum of squares / the number of those things = average sum of squares

There is less variation around the line that we fit by least-squares

* We can say that some for the variation in mouse size is "explained" by taking mouse weight into account

***So $R^2$ tells up how much of the variation in mouse size can be explained by taking mouse weight into account.***

$R^2 = \frac{Var(mean) - Var(fit)}{Var(mean)}$

Example: *$R^2$ = 0.6 = 60%: "There is a 60% reduction in variance when we take the mouse weight into account"* or *"mouse weight explains 60% of the variation in mouse size"*.

You can also use the sums of squares to make the same calc:
$R^2 = \frac{SS(mean) - SS(fit)}{SS(mean)}$

Adding terms will never reduce $R^2$!
This is because lesat-sqaures would make the offending term(s) go to 0

* Cause any term that makes SS(fit) worse to be multiplied by 0
* However, the more stupid paramters added to the equation, the more chance there for random events to result in a better $R^2$
* Because of this, people report an "adjusted" $R^2$ value that in essence, scales R^2 by the number of parameters

What if we had only 2 measurements however?

* SS(fit) = 0 => R^2 = 100%
* Any two random points would give exact same thing, doesnt mean anything
* So need a stats test to prove it's significant

The p-value for R^2 comes from something called F:

* Tells you how reliable the fit is!
* F = the variation explained by the extra parameters in the fit / the variation not explained by the extra parameters in the fit
* $F = \frac{SS(mean) - SS(fit) / (p\_{fit} - p\_{mean})}{SS(fit) / (n - p\_{fit})}$
* p are the degrees of freedom
* Why divide SS(fit) by $n - p\_{fit}$ instead of just n?
  * The more params you have in your equation, the more data you need to estimate them
  * For example, you only need two points to estimate a line, but you need 3 points to estimate a plane
* If the fit is good F = large num / small num

To calc p-value:

* You could gen histogram from lots of random datasets and then see where you f-score for the dataset sits
* What is more common is to generate an F-dstribution based off a line: $(p\_{mean} - p\_{fit}) = 1$, $(n - p\_{fit}) = 10$
  * the number of degrees of freedom determines the shape of the line

# Maximum Likelihood

The goal of maximum likelihood is the find the optimal way to fit a distribution to the data.

Example:

* Take normal distribution
* fit a bell curve with centre far from avg of points
* most of the points have a low probability or "likelihood" of being observed in the places they are
* if you shift the curve over so that its mean was the same as the average?
  * the likelihood of observing the points would be high
* if you kept moving it over, the likelihood of observing the points would be low again
* with the best mean found, you need to do the same for std. dev.

probability vs likelihood:

* likelihood specifically refers to this situation here; you are trying to find the optimal value for the mean or std dev for a dist given a bunch of observed measurements

# Odds and Log(Odds)

"The odds in favour of my team winning the game are 1 to 4"

odds are not probability

* they are the ratio of something happening vs to something not happening
* prob is the ratio of something happening vs everything happening

prob of something / prob of not something is the same as the odds

* odds of team losing go from 0 to 1 (1 : 32 => 0.03125)
* odds of team winning go from 1 to $\infty$ (32 : 3 => 10.67)
* this makes it difficult to compare the odds of winning vs losing
* taking the log of the odds helps with this

the log of the ratio of probs is called the ***logit function*** and formthe basis for logistic regression

log(odds) are very useful for solving certain stats problems

* specifically ones where we are trying to determin probs about win/lose, yes/no or true/false questions
* plotting dist of win : lose of many things will result in normal dist

|Has Cancer/Has mutated gene|Yes|No|
|---------------------------|---|--|
|Yes|23|117|
|No|6|210|

Odds ratio: $\frac{23 / 117}{6 / 210} = \frac{0.2}{0.03} = 6.88$
This means that the odds are 6.88 times greater that someone with the mutated gene will also have cancer
Hence log ratio: $1.93$

* The odds ratio and log of the odds ratio are like R-squared; they indicate a relationship between two things
* Larger values mean that the mutated gene is a good predictor of cancer
* Values close to 0 are bad: $log(1) = 0$
  * $log(0.001) = -6.91$ (so do opposite) (for every game I win someone else wins 1,000 times)
  * $log(100) = 4.6$ (for every game I lose, I win 100)
  * hence these are good predictors

3 ways to determine if an odds ratio is statistically signficant:

* Fisher's Exact Test
* Chi-Square Test
* The Wald test
  No consensus on what is best, so people just mix and match:
* Some people use Fisher's/Chi-Square test to get p-values
* Wald Test to calculate a confidence interval
* Others use just Wald Test for confidence interval/p-values
* So need to check what is best for your field

# Logistic Regression

* Predicts if something is True or False
* Fits an S shaped logistic function
* Test to see if a variable's effect on the prediction is significantly different from 0
  * If not, it means the variable isnot helping the prediction
  * This is called Wald's test
* Instead of using SSR and R^2 it uses ***maximum likelihood***
* Logistic Regression is a specific type of **Generalised Linear Model** (**GLM**)

Continuous values:
Because with logistic regression, the y-axis is confined to probability values between 0 and 1

* solve problem by transforming to the log odds, so like with linear regression the y-axis can go from $-\infty$ to  $+\infty$

So we use the **logit function**: $\log{\frac{p}{1 - p}}$

* So all values that are true (1) -> $\infty$
* All values that are false (0) -> $-\infty$

Take example logisitic regression line: $y = -3.48 + 1.83\times weight$
So the first coefficient is the y-axis intercept

* when weight (x-axis) = 0, then log(odds of obesity) = -3.476
  * In other words, if you dont weigh anything, the odds are against you being obese!! Duh!
* The slope: for every one unit of weight gains, the log(odds of obesity)  increases by 1.825

Descrete variable:

***Need to come back to this (2nd vid for logistic regression)***

# Linear Models for T-Tests and ANOVA

***Need to come back to this***

# Gradient Descent

Can be used to optimise least squares like in notes above!
For: $y = ax + b$
start with least squares estimate for the slope a
we use gradient descent to find optimatal value for b

set b = 0, any number will do
calc SSR

* NOTE: the SSR is a type of **loss function**

Keep changing the intercept and plot a graph of intercept vs SSR

* Inefficent way of doing this would be to calc lots and lots of points
* Gradient descent makes this way more efficent
  * Does a few calcs when far from the optimal solution
  * increases the number of calcs, close to the optimal value
* You can derive an equation for a line that describes the SSR
* Determine derivative of the function
* Then take steps towards min value approaches derivative = 0
  * This is v useful because get around times where it's impossible for derivative = 0
  * The size of the step should be dependant on the size of the derivative
  * This is determined by a **step size** called the
    * Mutiply the derivative by a small number called a **learning rate**, the combination of these two is the step size
  * So in this case, the new intercept = old intercept - step size
  * This process repeats itself
  * It will stop when the step size is very close to 0

How to do grad descent for both a and b?

* Take derivative with respect to the intercept also do the same with respect to the slope
  * When you have 2 or more derivatives of the same function, they are called a **gradient**
  * This is why the algorithm is called **gradient descent**!
* Pick rando number for intecept and slope
  * Gives 2 SSRs
* Calc step size for both
* Adjust intercept and slope by step size

In general:

1. Take the derivative of the **Loss Function** for each parameter in it. Meaning take the **Gradient** of the **Loss Function**.
1. Pick rando values for all parameters.
1. Plug param values into the gradient
1. Calc step size
1. calculate new params
1. Go back to step 3 and repeat till step size small or max num of steps reached

For a lot of data points, this can take long time
So, **stochastic gradient descent** that uses a rando selected  subset of the data at every step, rather than the full dataset

# Gradient Boosting: Regression Main Ideas

Grad boost very similar to AdaBoost

When starting, grad boost creates a single leaf that is the avg of the target var
Then grad bost builds a tree, that is based on the errors of the previous tree.

* This tree is larger than stump but still restricts the size of the tree
* In practice, people ofen set the num of leaves to be between 8 and 32

Grad boost will scale each tree by a fixed amount, unlike AdaBoost (amount of say)
It will then build tree based of the errors of the previous tree.
It will then build trees in this fashon till made num of trees asked for or aditional trees fail to improve fit.

1. Calc avg of the target feature as first 'tree'/leaf
   1. Better way: $F\_{0}(x) = \arg \max\_{\gamma}\sum\_{i=1}^{n}L(y\_{i}, \gamma)$, $L$ is loss func
   1. Either find best value via grad descent or if ez derivative to solve for 0, do that
1. Build tree on errors of first tree: error = obvs - pred, this is called a **pseudo residual**. The pseudo part is a reminder that we are doing grad boost, not linear reg.
1. Now use input vars to predict the residuals to build tree. A leaf of this tree may pointwards two residuals. If this happens, get avg of residuals on leaf.
1. Now combine original leaf with the new tree for pred. Effectively this new tree 'corrects' for the error of the og leaf. After doing this once, the bias will be low but varience high (overfit), so there is a learning rate to correct for this. Multiple learning rate by new tree's residual pred. Between 0 and 1. This results in a small step in the right direction. Taking lots of small steps in the right direction results in lower varience.
1. Calc psuedo residuals again based of new preds and do the same.
1. Keep doing this until num trees reached or the sum of residuals do not significantly decrease.

Gradient boost is called gradient boost because the residual is the **Gradient** that comes from **Gradient descent**.

# Gradient Boost: Classification Main Ideas

***Need to come back to this!***

# Regularization: Ridge (L2) Regression

* Another way of saying desensitisation (lol)

Use Linear regression aka least squares:

* example: has intercept and slope
  * training data has 2 points
  * testing has 8
  * SSR = 0 for training, for testing is high
    * high varience (overfit to training)
* Main idea behind ridge regression is to find a new line that doesn't fit the training data as well
  * introduce a small amount of bias
  * in return we get a significant drop in variance

Example: size = intercept + slope * Weight
Lin reg minises: SSR
Ridge regression tries to minimises: SSR + $\lambda \times {slope}^2$

* The added tern adds a penalty to the traditional least squares method

So when the slope of the line is steep, then the prediction for size is very sensitive to relatively small changes in weight
So predictions made with the ridge regression line are less sensistive to weight than the least squares line
The large lambda, the slope get asymptotically close to 0
To find the value for lambda, try typically 10-fold cross validation to determine which one results in the lowest variance

Also works on descrete data:
size = 1.5 + 0.7 * high fat diet

so ridge regression minimises: SSR + $\lambda \times {diet difference}^2$

* diet difference refers to the distance in size between normal diet and high far diet

for more complex model:
size = intercept + slope * weight + diet difference * high fat diet
so penalty term is: lambda * (slope ^ 2 + diet difference ^ 2)

so in general, the penalty term will apply itself to every parameter, except for the intercept, is scaled by the measurements

you cant make a line with one data point
nor a plane with 2 data points

* you would need at least 10,001 data points to make an equation of 10,001 parameters,
  * sometimes that's not possible
* what do you do here?

use ridge regression!

* The penalty can solve for all 10,001 params with 500 samples or fewer

# Regularization: Lasso (L1) Regression

Very similar to ridge regression but has some important differences
Intead the penalty is: $\lambda \times |slope|$

* adds a bit of bias but less variarience than leat squares

The big difference is that L1 can make the slope go to 0

* Ridge can only do this asymptotically

This can eleminate any terms in an equation that are stupid to 0

So lasso does better when there are lots of useless parameters
Ridge does better then most of the variables are useful

# XGBoost: Regression

Has lots of parts but are simple:

1. Gradient boost(ish) (wont be covered as done before)
1. Regularization (wont be covered as done before)
1. A unique regression tree
1. Approximate greedy algorithm
1. Weighted quantile sketch
1. Sparsity-aware split finding
1. Parallel learning
1. Cache-aware access
1. Blocks for out-of-core computation

XGBoost was designed to be used with large, complicated datasets

## Unique Regression Tree

First step in fitting XGBoost to the training data is to make an initial prediction

* This prediction can be anything but by default it is 0.5, regardless if it's regression or classification

Like with gradient boost, XGBoost fits a regression tree to the residuals

* However, XGBoost uses a unique regression tree that the vid calls XGBoost tree
  There are many ways this tree can be built, but this is the most common way for regression

1. Each tree starts with a single leaf, all residuals go to the leaf
1. Calculate a quality score or similarity score for the residuals
   1. Similarity score = SSR / (num residuals + $\lambda$)
   1. This similarity score is a simplification of second order Taylor approximation of the loss function described in grad boost
   1. Also, the lambda here will just be for L2 regularisation
   1. L1 will make the sim score simplify to something different
1. Now the question is whether or not we can do a better job clustering similar residuals if we split them into two groups
   1. Focus on the two points that are smallest (x-axis)
   1. Get avg value
   1. Make a split based off the avg value
   1. Calc similarity score for both leafs
1. Now need to quanitify how much better the leaves cluster similar resdiuals than the root, do this by calculating the gain
   1. $gain = left\_{similarity} + right\_{similarity} - root\_{similarity}$
1. Now shift the threshold over so that it is the avg of th next two observation
   1. More gain is good, is better at splitting the residuals into clusters of similar values
1. Get best tree based of thresholds
1. Try to split leaves further, the root in the gain calc refers to the parent node of the leaves
1. Keep going till at max depth (default is 6)

How to prune this tree?

* Pruned based on its gain values
* Start with a number, for example, 130
  * This is called $\gamma$ gamma
  * Then calc the difference between the gain asscociated with the lowest branch in the tree and gamma: $gain - \gamma$
    * if the difference is positive then the branch is not removed, if it is neg then remove
    * once you find a pos difference, then stop pruning
  * This can also remove the root of the tree, leaving just the original prediction, which is pretty extreme pruning

The regularization term:

* This will decrease similarity scores
* This will tend to stop the trees getting so large as it's harder for a branch to have a lower sim score than its parent
* This also can make the pruning more agressive as $\gamma$ is more likely to be larger than the gain
* In the case of gain being less than 0, setting gamma = 0 will not turn off pruning

Output value = sum of residuals / (num of residuals + $\lambda$)

* This refers to the output value for each leaf
* Pretty similar to the similarity score except it's not SSR
* This also means that lambda will reduce the amount a leaf will contribute to a prediction
  * So will reduce the sensistivity to an indivual observation

Like with gradient boost, there is a learning rate that scales the tree

* XGboost calls this learning rate: $\epsilon$ (eta but this is epsilon?)
  * Default value is 0.3

So output = inital pred + learning rate * output value for the leaf that the point goes down to

Now build new tree based on the new residuals

The two reasons to use XGBoost are also the two goals of the project:

* Execution Speed
* Model Performance

**Sparse Aware**: implementation with automatic handling of missing data values.
**Block Structure**: to support the parallelization of tree construction.
**Continued Training**: so that you can further boost an already fitted model on new data.

## Approximate Greedy Algorithm

When fitting a tree to the residuals

* was done by calculating the similarity scores and the gain for each possible threshold
* the threshold with the largest gain is the one XGBoost uses
* The decision to use the threshold that gives the largest gain is made without worrying about how the leaves will be split later
* This means XGBoost uses a greedy algorithm
* In other words, since XGBoost uses a greedy algorithm, it amkes a decision without looking ahead to see if it is the absolute best choice in the long term
* If it did not use this algo, it woukld postpone making a final decision about this threhold, until after trying different thresholds in the leaves to see how things played out in the long run
* So, the greedy algo makes XGBoost a tree relatively quickly

When you have lots of data points, the greedy algo still has to look through every possible threshold

* on top of that, you'd have to do this for every other feature in your data
* this would take forever
* this is where the approximate greedy algo comes in

Instead, divide the data into quantiles and use that for thresholds instead
By default, XGBoost uses "about" 33 quantiles

* The "about" comes from the Parallel Learning an Weighted Quantile Sketch

## Parallel Learning & Weighted Quantile Sketch

Get your data and split it into small pieces and putting the peices on different computers on a network
The quantile sketch algorithm combines the alues form each computer to make an approximate histogram
Then the approximate histogram is used to calculate approximate quantiles
The Approximate greedy algorithm uses these approximate quantiles

What about the weighted part?

Usually, quantiles are set up so that the same number of observations are in each one

* In contrast, with weighted quantiles, each observation has a corresponding weight
* The sum of the weights are the same in each quantile
* The weights are derived from the cover metric
  * the weight for each observation is the 2nd derivative of the loss function, what we are referring to as the Hessian (not Gradient)
* This means for regression the weights are all equal to 1
  * This means that the the weighted quantiles are just like normal quantiles and contain an equal number of observations
* In constrast, for classification: weight = previous prob i * (1- previous prob i)

Only uses the approx greedy algo, parallel learning and the weighted quantile sketch then the training data is huge

When the trainin set is not so large, a normal greedy algo is used

## Sparsity-Aware Split Finding

Have a few missing values

* Even with this, we can just use the base leaf to calculate the residuals for rows with missing data

split the data into two table

* one with all e.g. dosage values
* other with all values without dosage values

Table with dosage values:

* sort rows low to high
* calc candidate thresholds

The first gain value, gain left, is calculated by putting all of the resdiuals with missing dosage values into the leaf on the left, save gain
Do the same for leaf on the right, save gain

Do this for all candidate thresholds
You then pick the tree with highest gain

So example, Dosage \< 15.5, going left will be the default path for all future observations that are missing dosage values

## Cache-Aware Access

This is where XGBoost starts to get super nitty gritty

Basic idea:

* Inside computer we have:
  * CPU
  * CPU has a small amount of cache memory -- CPU can use this mem faster than any other memory on the computer
  * CPU attatched to large amount of main memory, larger but slower than cache
  * HDD, very slow but largest

XGBoost puts the gradients and Hessians in the cache, so that is can rapdily calculate similarity scores and output scores

## Blocks for Out-of-Core Computation

When the dataset is too large for the cache and main memory, then some of it must be stored on the HDD

Because reading and writing data to the HDD is super slow, XGBoost tries minimising these actions by compressing the data

When there is more than one HDD, XGBoost uses a databse technique called sharding to speed up disk access

* The when the CPU needs data, both drives can be reading data at the same time

---

Finally, XGHBoost can speed things up by allowing you to build each tree with only a random subset of the data.

AND, can build trees by only looking at a random subset of features when deciding how to split the data.
