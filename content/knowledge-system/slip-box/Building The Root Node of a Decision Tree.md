Zettelcasten Index: 20230227115732-b
Sequence:
Status: #idea
Zettelcasten Tags: [Data Science](../map-of-content/Data%20Science.md), *Machine Learning*, *Artificial Intelligence*, [Decision Trees](Decision%20Trees.md), [Decision Trees Branches And Nodes](Decision%20Trees%20Branches%20And%20Nodes.md)

---

To begin making a decision tree, a feature is chosen to create the [root](Decision%20Trees%20Branches%20And%20Nodes.md) of the tree. This root is created based off the feature that best predicts the target variable.

````mermaid
flowchart TD
    A[Loves popcorn]
    A --> |True| B[Loves the song]
    A --> |False| C[Deos not love the song]
````

````mermaid
flowchart TD
    A[Loves pop]
    A --> |True| B[Loves the song]
    A --> |False| C[Deos not love the song]
````

````mermaid
flowchart TD
    A[Loves cats]
    A --> |True| B[Does not loves the song]
    A --> |False| C[Loves the song]
````

|Feature|Correct Prediction|Incorrect Prediction|Accuracy|
|-------|------------------|--------------------|--------|
|Loves popcorn|90|10|90%|
|Loves pop|65|35|65%|
|Loves cats|55|45|55%|

*Loves popcorn* is chosen because it has the highest accuracy and is chosen as the root node.

## References

* [StatQuest with Josh Starmer > Decision Trees](../references/StatQuest%20with%20Josh%20Starmer.md#decision-trees)
