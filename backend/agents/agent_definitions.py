"""
Agent and Task Definitions for Clinical Trial Site Selection
Defines all agents and their tasks for both Part 1 and Part 2
"""

from crewai import Agent, Task
from langchain_anthropic import ChatAnthropic
import os

# Initialize Claude LLM
CLAUDE_LLM = ChatAnthropic(
    model="claude-3-5-sonnet-20241022",  # Much cheaper than Claude 4
    anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
    temperature=0.3,
    max_tokens=2048  # Reduced from 4096 - still plenty for this task
)


# ============================================================================
# PART 1: SITE SELECTION AGENTS
# ============================================================================

def create_site_selection_strategist_simple(tools):
    """Single agent: Gets top 10 sites and explains them"""
    return Agent(
        role='Site Selection Strategist',
        goal='Use the analysis tool to get top 10 sites and explain the rankings',
        backstory="""Site selection expert. Use AnalyzeAndRankSitesTool to get the top 10 sites, 
        then explain why each site was selected. Be concise - 2 sentences per site max.""",
        llm=CLAUDE_LLM,
        tools=tools,
        verbose=True,
        allow_delegation=False
    )


def create_patient_availability_analyst(tools):
    """Agent 2: Analyzes patient density and access"""
    return Agent(
        role='Patient Availability Analyst',
        goal='Identify sites with high patient access and low competition',
        backstory="""Patient recruitment specialist who evaluates geographic patient availability. 
        Focus on finding sites with good patient pools and minimal competing trials.""",
        llm=CLAUDE_LLM,
        tools=tools,
        verbose=True,
        allow_delegation=False
    )


def create_site_selection_strategist(tools):
    """Agent 3: Synthesizes data and makes final recommendations"""
    return Agent(
        role='Site Selection Strategist',
        goal='Rank top 10 sites with clear, concise justifications',
        backstory="""Strategic site selector who synthesizes performance and patient data. 
        Identify hidden gems and flag risky choices. Be concise.""",
        llm=CLAUDE_LLM,
        tools=tools,
        verbose=True,
        allow_delegation=False
    )


# ============================================================================
# PART 1: SITE SELECTION TASKS
# ============================================================================

def create_recommend_sites_task_simple(agent, tools):
    """Single task: Get and explain top 10 sites"""
    return Task(
        description="""Use AnalyzeAndRankSitesTool to get the top 10 sites. 
        Then provide a 1-2 sentence explanation for each site's ranking. 
        Highlight Site-047 (Omaha) if it's in the top 10.""",
        agent=agent,
        expected_output="Top 10 sites with brief explanations (max 2 sentences each)",
        tools=tools
    )


def create_assess_patient_density_task(agent, tools, context):
    """Task 2: Assess patient availability and competition"""
    return Task(
        description="""Use ReadPatientDensityTool. From the best_access_sites returned, 
        select the top 15 site IDs (just IDs, comma-separated). Focus on low competition.""",
        agent=agent,
        expected_output="Comma-separated list of top 15 site IDs with best patient access",
        tools=tools,
        context=context
    )


def create_recommend_sites_task(agent, tools, context):
    """Task 3: Generate final site recommendations"""
    return Task(
        description="""Combine site IDs from both previous tasks (max 30 total). 
        Use CalculateCompositeScoreTool with these IDs. Then use RankSitesTool to get top 10. 
        Highlight Site-047 (Omaha) if present. Keep output brief.""",
        agent=agent,
        expected_output="Top 10 sites with scores and brief reasoning (2-3 sentences per site max)",
        tools=tools,
        context=context
    )


# ============================================================================
# PART 2: TRIAL MONITORING AGENTS
# ============================================================================

def create_enrollment_monitor(tools):
    """Agent 4: Monitors real-time enrollment data"""
    return Agent(
        role='Enrollment Monitor',
        goal='Detect underperforming sites and generate alerts',
        backstory="""Trial monitoring specialist who tracks enrollment data and flags issues. 
        Focus on identifying flatlined sites and trends.""",
        llm=CLAUDE_LLM,
        tools=tools,
        verbose=True,
        allow_delegation=False
    )


def create_predictive_forecaster(tools):
    """Agent 5: Generates probabilistic forecasts"""
    return Agent(
        role='Predictive Forecaster',
        goal='Run Monte Carlo simulation and generate enrollment forecast',
        backstory="""Biostatistician who creates enrollment forecasts using simulation. 
        Provide P10, P50, P90 projections and probability of meeting target.""",
        llm=CLAUDE_LLM,
        tools=tools,
        verbose=True,
        allow_delegation=False
    )


def create_strategic_advisor(tools):
    """Agent 6: Generates recommendations"""
    return Agent(
        role='Strategic Advisor',
        goal='Review alerts and provide brief recommendations for underperforming sites',
        backstory="""Clinical ops strategist. Review alerts and suggest 1-2 interventions. Be very brief.""",
        llm=CLAUDE_LLM,
        tools=tools,
        verbose=True,
        allow_delegation=False
    )


# ============================================================================
# PART 2: TRIAL MONITORING TASKS
# ============================================================================

def create_monitor_enrollment_task(agent, tools):
    """Task 4: Monitor ongoing enrollment and detect issues"""
    return Task(
        description="""Read weekly enrollment feed. Calculate site summaries and trends. 
        Use DetectAnomaliesToolSchema to flag underperforming/flatlined sites. 
        Be concise - list critical issues only.""",
        agent=agent,
        expected_output="Site-by-site status with flagged issues and alerts",
        tools=tools
    )


def create_forecast_enrollment_task(agent, tools, context):
    """Task 5: Generate probabilistic enrollment forecast"""
    return Task(
        description="""Use MonteCarloSimulationTool with enrollment data. Generate P10/P50/P90 
        forecasts for 39 remaining weeks. Calculate probability of hitting 200-patient target. 
        Be concise.""",
        agent=agent,
        expected_output="Forecast curve data (P10/P50/P90), projected final enrollment, success probability",
        tools=tools,
        context=context
    )


def create_generate_recommendations_task(agent, tools, context):
    """Task 6: Generate intervention recommendations and what-if scenarios"""
    return Task(
        description="""Review alerts and forecast from previous tasks. 
        Recommend ONE intervention for the worst performing site. 
        Use CalculateROITool ONCE only. Be concise - 2-3 sentences max.""",
        agent=agent,
        expected_output="Single recommended intervention with ROI and brief justification",
        tools=tools,
        context=context
    )