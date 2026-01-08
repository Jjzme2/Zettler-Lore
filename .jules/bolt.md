# Bolt's Journal

## 2024-05-22 - Data Mapping Complexity
**Learning:** Nested loops for mapping relational data in memory (e.g. `shelves.map(s => stories.filter(st => st.shelf === s.id))`) cause O(N*M) complexity.
**Action:** Always pre-group the child data into a Map or Record (O(N+M)) before mapping the parent data.
