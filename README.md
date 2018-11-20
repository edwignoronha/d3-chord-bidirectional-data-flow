# d3-chord-bidirectional-data-flow
An implementation of the D3 Chord Diagram showing the inter-segment bi-directional flow of data .

Demo Link:
	https://d3-chord.herokuapp.com/

A **chord diagram** is a graphical method of visualising the weighted and directed relationships across entities. Hence the dataset used for this visualisation can be tabulated. 

The relationship can be defined across entities that can be classified into disjoint and independent categories (bipartite). Hence the relationship goes **between** entities in different categories. Sankey Diagrams are more suited for this kind of logical distinction between groups of entities and if the relationship is unidirectional. 

Chord diagrams most often define relationships across the entities that belong to a single category. And hence the relationship goes **within** entities of a single category. Also, the relationships are often bidirectional.

### Structure of the diagram:
* Each entity is represented by a fragment (arc) arranged radially around the outer part of the circular layout.
* Each relationship is represented by a chord/Bezier curve joining entity pairs.

The most common relationship depicted in a chord diagram is the directed flow of some measured value across the entities. The flow can be either unidirectional or bidirectional. In case of unidirectional flow, the diagram assumes zero flow from the opposite direction. In case of bidirectional flow, we have two options of visualizing the relationship:
* One asymmetric chord per entity pair
* Two chords per entity pair

The relationships across entities are used to display that they share something in common. This makes Chord Diagrams ideal for comparing the similarities within a dataset or between different groups of data.
Values are assigned to each relationship to quantify the importance of the flow, which is represented proportionally by the size of each chord. Colour can be used to group the data into different categories, which aids in making comparisons and distinguishing groups.

Chord diagrams can answer questions about your data, such as the following:
*What is the volume of flow between categories?
*Are there anomalies, differences, or similarities in the volume of flow?
