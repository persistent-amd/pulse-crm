# PULSE CRM

### A Shopper Command Center

## Vision

Pulse CRM is an AI-native customer engagement platform inspired by modern retail marketing systems.

The product helps marketers:

* Understand customer behavior
* Discover high-value audiences
* Generate personalized campaigns
* Simulate omnichannel communication
* Measure campaign impact
* Receive AI-generated recommendations

Pulse CRM is NOT a sales CRM.

It is a shopper engagement and marketing intelligence platform.

---

# Product Philosophy

Most CRMs require marketers to:

* manually analyze customer data
* manually create segments
* manually write campaigns
* manually decide channels

Pulse CRM should feel like an intelligent command center.

The AI should help marketers think, decide and act.

The primary workflow:

Customer Data
→ Audience Discovery
→ AI Recommendations
→ Campaign Creation
→ Campaign Delivery
→ Attribution & Analytics

# AI Philosophy

Pulse CRM is an AI-native Shopper Command Center.

AI must be woven directly into marketer workflows and decision-making.

The product should NOT feel like a traditional CRM with a chatbot attached.

AI should help marketers:

* Discover opportunities
* Identify audiences
* Generate campaigns
* Recommend channels
* Explain reasoning
* Suggest next actions

Primary AI capabilities:

1. AI Audience Generation
2. AI Campaign Generation
3. AI Opportunity Discovery
4. AI Marketing Brief Generation

Optional:

5. Conversational Command Center

If implemented, the conversational interface must trigger real CRM actions and workflows rather than acting as a generic chatbot.

The product philosophy is:

Data → AI Insight → Audience → Campaign → Delivery → Analytics

rather than:

Data → CRUD Operations → Chatbot

The assistant should trigger real product actions instead of acting as a generic chatbot.

Avoid open-ended chat experiences.

---

# Core User

Marketing Manager at a D2C or Retail Brand.

Examples:

* Fashion Brand
* Coffee Chain
* Beauty Brand
* Electronics Brand

Goal:

Increase repeat purchases and customer engagement.

---

# Tech Stack

Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* shadcn/ui
* Recharts

Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Alembic
* Pydantic

Infrastructure

* Docker
* Vercel
* Railway
* Neon PostgreSQL

AI

* Gemini 2.5 Flash
* Structured JSON outputs
* No agent frameworks
* No vector databases
* No RAG

---

# Repository Structure

pulse-crm/

frontend/
backend/
channel-service/
docs/

The channel service MUST be a completely separate FastAPI application.

---

# Core Features

## 1. Customer Data Ingestion

Support:

customers.csv

orders.csv

Capabilities:

* upload CSV
* validation
* duplicate detection
* error reporting
* import summary

Display:

Imported

Skipped

Duplicate

Failed

Generate downloadable error report.

---

## 2. Customer 360

Each customer should have:

Profile

Order History

Campaign History

Communication Timeline

Customer Metrics

Lifetime Value

Total Orders

Last Purchase Date

Average Order Value

AI Persona

Examples:

* High Value Loyalist
* Weekend Shopper
* Discount Hunter
* Churn Risk
* New Customer

Personas can be rule-generated.

No ML required.

---

## 3. Audience Builder

Rule-based segmentation.

Supported filters:

Revenue

Order Count

Last Purchase Date

City

Persona

Examples:

Revenue > 5000

Last Purchase > 45 days

Persona = Churn Risk

Save audiences.

Display audience size.

---

## 4. AI Audience Generator

Natural language input.

Example:

"Show customers who spend a lot but haven't purchased recently."

Gemini converts request into structured JSON.

Backend converts JSON into filters.

Display generated logic.

Allow user approval.

---

## 5. Campaign Studio

Step 1

Choose Audience

Step 2

Choose Channel

* WhatsApp
* SMS
* Email
* RCS

Step 3

Campaign Goal

* Retention
* Win Back
* Upsell
* Product Launch

Step 4

Generate Message

AI generates:

Campaign Name

Message

Channel Recommendation

Reasoning

Editable before launch.

---

## 6. Dynamic Variables

Support:

{{customer_name}}

{{favorite_category}}

{{last_purchase_date}}

{{recommended_product}}

Preview personalized message.

Inspired by modern retail CRM platforms.

---

## 7. Channel Service

Separate FastAPI service.

Endpoint:

POST /send

Input:

recipient

campaign_id

message

channel

Store communication.

Simulate lifecycle asynchronously.

Possible events:

sent

delivered

failed

opened

read

clicked

converted

Generate randomized events with realistic probabilities.

Send callbacks to CRM.

---

## 8. CRM Receipt API

Endpoint:

POST /receipt

Receives events.

Update communication state.

Store event history.

Handle:

duplicates

retries

out-of-order events

Maintain event timeline.

This is an important evaluation area.

---

## 9. AI Opportunity Feed

Primary differentiator.

Dashboard cards:

"214 customers have not purchased in 60 days"

"Weekend shoppers respond better to WhatsApp"

"18 high-value customers show churn signals"

Each card should provide:

Recommended Action

Generate Campaign button

Create Audience button

---

## 10. Analytics

Metrics:

Messages Sent

Delivery Rate

Open Rate

Read Rate

Click Rate

Conversion Rate

Revenue Attribution

Views:

Campaign Performance

Audience Performance

Channel Performance

Top Campaigns

Revenue Generated

---

# Dashboard Layout

Top KPI cards:

Customers

Orders

Revenue

Campaigns

Messages Sent

Conversion Rate

Below:

AI Opportunity Feed

Recent Campaigns

Top Audiences

Campaign Analytics

---

# UI Design

Theme:

Background:
#f6f7eb

Primary:
#393e41

Accent:
#e94f37

Design Inspiration:

* Linear
* Vercel
* Xeno
* Retool

Requirements:

* professional SaaS feel
* spacious layout
* premium cards
* minimal animation
* desktop-first

---

# Seed Data

Generate realistic retail data:

1000 customers

5000 orders

Multiple cities

Multiple categories

Realistic dates

Generate enough data for meaningful analytics.

---

# Explicit Non-Goals

Do NOT build:

* Loyalty Program
* Referral System
* Rewards Marketplace
* Ticketing System
* Sales Pipeline
* Lead Management
* Multi-agent frameworks
* Vector databases

Focus entirely on:

Data
→ Audiences
→ Campaigns
→ Delivery
→ Attribution
→ AI Insights

---

# Evaluation Priorities

Optimize for:

1. Product thinking
2. AI-native experience
3. System design clarity
4. Communication lifecycle modeling
5. Code quality
6. Explainability
7. Demo quality

Every feature should be defendable in a final interview.