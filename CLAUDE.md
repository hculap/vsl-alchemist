# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VSL-Alchemist is an AI-powered marketing automation tool designed for high-ticket experts and coaches. The product automates the creation of Video Sales Letters (VSL) and associated ad campaigns, reducing the time from 30-40 minutes to just a few minutes.

### Core Architecture
- **Backend**: Express.js + PostgreSQL + Genkit framework for AI workflow orchestration
- **Tech Stack**: 
  - JWT-based authentication for user management
  - PostgreSQL for data persistence
  - Genkit flows for AI-powered content generation
  - Express.js REST API server

### Key Components
- **masterCampaignFlow**: Main orchestration flow that coordinates VSL and ad generation
- **generateVslFlow**: Specialized flow for creating 15-minute VSL scripts
- **generateAdsFlow**: Specialized flow for Meta Ads content (video scripts, copy, headlines)
- **Business Profile System**: User configuration for personalized AI generation

## Planned Development Phases

### Version 1.0 (Current Focus)
- Basic campaign generation workflow
- Business profile configuration
- VSL script generation (2 versions)
- Meta Ads content generation (4 video scripts, 2 copy versions, 2 headlines)
- Simple text editor and export functionality

### Version 2.0 (Future)
- RAG (Retrieval-Augmented Generation) for personalization using user's own content
- PostgreSQL Vector Store integration (pgvector)
- Custom knowledge base training

### Version 3.0 (Future)
- Text-to-video production capabilities
- Complete video generation pipeline

## Target User
"Scaling Expert" - professionals offering high-ticket services (coaching, consulting, courses) who need to automate their marketing content creation while maintaining consistency and quality.

## Key Technical Principles
1. **Workflow-Centric Design**: Mirror natural creative process but accelerate it
2. **Content Consistency**: All generated materials must be thematically and tonally cohesive
3. **Expert Simplicity**: Hide AI complexity behind business-focused interfaces
4. **Technical Excellence**: Built for scale and future AI capabilities

## Business Context
This is a defensive security-focused analysis tool. The product helps experts create legitimate marketing materials through AI automation, focusing on time savings and consistency rather than deceptive practices.