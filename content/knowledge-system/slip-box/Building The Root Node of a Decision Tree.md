Zettelcasten Index: 20230227115732-a1
Sequence: [Building the Root Node of a Decision Tree With Numerical Features](Building%20the%20Root%20Node%20of%20a%20Decision%20Tree%20With%20Numerical%20Features.md)
Status: #idea
Zettelcasten Tags: [Data Science](../map-of-content/Data%20Science.md), *Machine Learning*, *Artificial Intelligence*, [Decision Trees](Decision%20Trees.md), [Gini Impurity of Decision Tree Leaves](Gini%20Impurity%20of%20Decision%20Tree%20Leaves.md), [Decision Tree Gini Impurity](Decision%20Tree%20Gini%20Impurity.md)

---

The root node of a [decision tree](Decision%20Trees.md) is built via calculating the [gini impurity](Decision%20Tree%20Gini%20Impurity.md) of each root tree for each feature. The the feature that generates the lowest gini impurity is then chosen as the root.

````mermaid
flowchart TD
    A[Loves popcorn\nGini impurity: 0.32]
    A --> |True| B[Loves the song]
    A --> |False| C[Deos not love the song]
````

````mermaid
flowchart TD
    A[Loves pop\nGini impurity: 0.1]
    A --> |True| B[Loves the song]
    A --> |False| C[Deos not love the song]
````

````mermaid
flowchart TD
    A[Loves cats\nGini impurity: 0.48]
    A --> |True| B[Does not loves the song]
    A --> |False| C[Loves the song]
````

## References

* [StatQuest with Josh Starmer > Decision Trees](../references/StatQuest%20with%20Josh%20Starmer.md#decision-trees)
