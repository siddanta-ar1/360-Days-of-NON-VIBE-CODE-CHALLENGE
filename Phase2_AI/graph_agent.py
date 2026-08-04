# graph_agent.py
import os
from neo4j import AsyncGraphDatabase
from logger_config import get_logger

# Connect to your Neo4j AuraDB instance (or local Docker container)
NEO4J_URI = os.environ.get("NEO4J_URI")
NEO4J_USER = os.environ.get("NEO4J_USER")
NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD")

driver = AsyncGraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

async def fetch_prerequisite_tree(target_concept: str, depth: int = 3) -> str:
    """
    Executes a multi-hop Cypher traversal in Neo4j to map the learning path 
    for a given mathematical concept.
    """
    logger = get_logger()
    logger.info("graph_traversal_started", concept=target_concept, depth=depth)
    
    # The Cypher query:
    # 1. Match the target concept.
    # 2. Traverse backward (*1..depth) along the IS_PREREQUISITE_OF relationship.
    # 3. Return the prerequisite nodes ordered by their distance from the target.
    cypher_query = """
    MATCH path = (prereq:Concept)-[:IS_PREREQUISITE_OF*1..$max_depth]->(target:Concept {name: $concept_name})
    RETURN prereq.name AS prerequisite, length(path) AS distance
    ORDER BY distance DESC
    """
    
    try:
        async with driver.session() as session:
            result = await session.run(cypher_query, concept_name=target_concept, max_depth=depth)
            records = await result.data()
            
            if not records:
                return f"No structural prerequisites mapped for '{target_concept}' in the knowledge graph."
                
            # Format the output into a hierarchical text string for the LLM
            prereq_list = []
            for record in records:
                prereq_list.append(f"- Level {record['distance']} Prerequisite: {record['prerequisite']}")
                
            formatted_tree = "\n".join(prereq_list)
            print(f"🕸️ GRAPH RAG SUCCESS: Mapped {len(records)} structural dependencies for {target_concept}.")
            
            return f"Structural Prerequisites for {target_concept}:\n{formatted_tree}"
            
    except Exception as e:
        logger.error("graph_traversal_failed", error=str(e))
        return "Error traversing knowledge graph."