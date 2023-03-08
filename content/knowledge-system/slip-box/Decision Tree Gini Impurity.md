Zettelcasten Index: 20230227115732-b2
Sequence:
Status: #idea
Katex: true
Zettelcasten Tags: [Data Science](../map-of-content/Data%20Science.md), *Machine Learning*, *Artificial Intelligence*, [Decision Trees](Decision%20Trees.md), *Gini Impurity*, [Decision Trees Branches And Nodes](Decision%20Trees%20Branches%20And%20Nodes.md), [Gini Impurity of Decision Tree Leaves](Gini%20Impurity%20of%20Decision%20Tree%20Leaves.md)

---

The total [gini impurity](Decision%20Tree%20Gini%20Impurity.md) of a tree is the weighted average of gini impurities (weighted on samples) of the leaves. These leaves are weighted as they may not represent the same number of samples.

Example:

````mermaid
flowchart TD
    A[Loves popcorn]
    C[Does not love the song\nSamples: 100\nGini impurity: 0.3]
    D[Loves cats]
    E[Loves the song\nSamples: 50\nGini impurity: 0.1]
    F[Does not love the song\nSamples: 10\nGini impurity: 0.5]

    A --> |True| D
    A --> |False| C

    D --> |True| E
    D --> |False| F
````

$\text{total gini impurity} = \frac{100}{160}\times0.3 + \frac{50}{160}\times0.1 + \frac{10}{160}\times0.5 = 0.25$

## References

* [StatQuest with Josh Starmer > Decision Trees](../references/StatQuest%20with%20Josh%20Starmer.md#decision-trees)
