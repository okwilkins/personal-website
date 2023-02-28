Zettelcasten Index: 20230227123735-d
Sequence:
Status: #idea
Zettelcasten Tags: *Learning*, *Diagrams*, [Mermaid](Mermaid.md), *Entity Relationship Diagram*, [Programming](../map-of-content/Programming.md), *Databases*, *Data*

---

````
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
````

````mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
````

## References

* [Mermaid#Entity Relationship Diagrams](../references/Mermaid.md)
