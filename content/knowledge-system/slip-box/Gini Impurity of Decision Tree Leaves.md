Zettelcasten Index: 20230227115732-b
Sequence: [Max and Min Gini Impurity of Decision Tree Leaves](Max%20and%20Min%20Gini%20Impurity%20of%20Decision%20Tree%20Leaves.md), [Decision Tree Gini Impurity](Decision%20Tree%20Gini%20Impurity.md)
Status: #idea
Katex: true
Zettelcasten Tags: [Data Science](../map-of-content/Data%20Science.md), *Machine Learning*, *Artificial Intelligence*, [Decision Trees](Decision%20Trees.md), *Gini Impurity*, [Decision Trees Branches And Nodes](Decision%20Trees%20Branches%20And%20Nodes.md)

---

$$\text{gini impurity} = 1 - prob\_{correct}^2 - prob\_{incorrect}^2$$
The gini impurity indicates the likelihood of new data being misclassified, based off the distribution of labels of the training dataset.

Example:

````mermaid
flowchart TD
    A[Loves popcorn]
    A --> |True| B[Loves the song\nCorrect predictions: 80\nIncorrect predictions: 20\nGini impurity: 0.32]
    A --> |False| C[Deos not love the song\nCorrect predictions: 60\nIncorrect predictions: 40\nGini impurity: 0.48]
````

## References

* [StatQuest with Josh Starmer > Decision Trees](../references/StatQuest%20with%20Josh%20Starmer.md#decision-trees)
