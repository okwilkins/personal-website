Zettelcasten Index: 20230227115732-b1
Sequence:
Status: #idea
Zettelcasten Tags: [Data Science](../map-of-content/Data%20Science.md), *Machine Learning*, *Artificial Intelligence*, [Decision Trees](Decision%20Trees.md), *Gini Impurity*, [Gini Impurity of Decision Tree Leaves](Gini%20Impurity%20of%20Decision%20Tree%20Leaves.md)

---

The maximum [gini impurity](Gini%20Impurity%20of%20Decision%20Tree%20Leaves.md) of a decision tree leaf occurs when a leaf is correct only 50% of the time. This means that the maximum gini impurity is `0.5`. Conversely, the minimum gini impurity is `0`. This happens when the leaf is correct 100% of the time.

Example:

````mermaid
flowchart TD
    A[Loves popcorn]
    A --> |True| B[Loves the song\nCorrect predictions: 100\nIncorrect predictions: 0\nGini impurity: 0]
    A --> |False| C[Deos not love the song\nCorrect predictions: 50\nIncorrect predictions: 50\nGini impurity: 0.5]
````

## References
