# Vacation Brain Technical Blueprint

**Version:** 0.1  
**Status:** Draft

---

# Purpose

Vacation Brain is not a chatbot.

It is a persistent travel intelligence that learns, reasons, remembers, and assists before, during, and after every trip.

Its architecture is designed around thinking, not answering.

---

# Initial Technical Direction

- Mobile app: Expo React Native
- Language: TypeScript
- Backend: Supabase
- Auth: Supabase Auth
- Database: Postgres via Supabase
- AI workflows: Claude Code for development; model choice TBD for runtime
- Source control: GitHub
- Docs: Markdown in repository

---

# Six Layers

## 1. Identity

Who is this traveler?

## 2. Memory

Working memory, trip memory, and long-term memory.

## 3. Knowledge

Static and dynamic travel knowledge. Dynamic data improves the experience but must not be required for the product to function.

## 4. Reasoning Engine

Determines the best next recommendation using traveler context, trip context, current context, and external knowledge.

## 5. Experience Engine

Determines how and when to communicate.

## 6. Learning Engine

Learns from accepted recommendations, ignored recommendations, changed plans, explicit feedback, and repeated behavior.

---

# Recommendation Pipeline

Observe → Understand → Predict → Evaluate → Recommend → Explain → Learn

---

# North Star

Every technical feature should improve one or more of:

- Remember better
- Reason better
- Recommend better
- Learn better
