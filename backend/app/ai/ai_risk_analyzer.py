import os
import json
from typing import Dict, Any
import google.generativeai as genai

class AIRiskAnalyzer:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")

        if not api_key or api_key.startswith("fake-"):
            print("⚠️ No valid API key, will use fallback analysis")
            self.model = None
        else:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
                print("Google Gemini initialized successfully")
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")
                self.model = None

    def analyze_feature_flag(self, flag_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Using Google Gemini to analyze feature flag risk
        """
        if not self.model:
            print("Using fallback analysis")
            return self._fallback_analysis(flag_data)

        try:
            prompt = self._build_prompt(flag_data)

            response = self.model.generate_content(prompt)

            result = self._parse_response(response.text)

            print(f"AI Analysis successful: {result['risk_level']} risk, score {result['risk_score']}")
            return result

        except Exception as e:
            print(f"AI Analysis failed: {str(e)}")
            return self._fallback_analysis(flag_data)

    def _build_prompt(self, flag_data: Dict[str, Any]) -> str:
        """
        Create Prompts
        """
        return f"""You are an expert software engineering risk analyst.

Analyze this feature flag submission for potential risks:

**Feature Flag Information:**
- Name: {flag_data.get('name', '')}
- Description: {flag_data.get('description', '')}
- Scope: {flag_data.get('scope', '')} (frontend/backend/database/all systems)
- Code Changes: {flag_data.get('code_changes', '')}
- Configuration: {json.dumps(flag_data.get('config', {}))}

**Your Task:**
Assess the risk level and provide detailed analysis.

**Risk Factors to Consider:**
1. System Impact: Does it affect critical systems (payment, auth, database)?
2. Data Safety: Any risk of data loss or corruption?
3. Rollback Difficulty: How easy is it to revert if something goes wrong?
4. User Impact: How many users affected? What's the blast radius?
5. Technical Complexity: ML models, external integrations, schema changes?

**Response Format:**
Respond ONLY with valid JSON (no markdown, no explanation):

{{
    "risk_level": "low|medium|high|critical",
    "risk_score": <number 0-100>,
    "detected_issues": ["issue1", "issue2", "issue3"],
    "ai_reasoning": "2-3 sentence explanation of why this risk level",
    "recommendation": "Suggested approval process"
}}

**Risk Level Guidelines:**
- low (0-29): Simple UI changes, non-critical features, easy rollback
- medium (30-59): API changes, integrations, moderate complexity
- high (60-74): Auth changes, database operations, payment systems
- critical (75-100): Data migrations, security changes, multi-system impact

**Examples:**
- Dark mode toggle → low risk (UI only)
- Email provider switch → medium risk (external integration)
- Payment processor migration → critical risk (financial transactions)
- Database schema change with DROP TABLE → critical risk (data loss)

Now analyze the feature flag above:"""

    def _parse_response(self, response_text: str) -> Dict[str, Any]:

        try:
            clean_text = response_text.strip()

            if clean_text.startswith("```"):
                parts = clean_text.split("```")
                if len(parts) >= 2:
                    clean_text = parts[1]

                    if clean_text.startswith("json"):
                        clean_text = clean_text[4:]

            clean_text = clean_text.strip()

            result = json.loads(clean_text)

            required_fields = ["risk_level", "risk_score", "detected_issues", "ai_reasoning", "recommendation"]
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Missing required field: {field}")

            valid_levels = ["low", "medium", "high", "critical"]
            if result["risk_level"] not in valid_levels:
                raise ValueError(f"Invalid risk_level: {result['risk_level']}")

            if not 0 <= result["risk_score"] <= 100:
                raise ValueError(f"Invalid risk_score: {result['risk_score']}")

            return result

        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {str(e)}")
            print(f"Response text: {response_text[:500]}")
            raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
        except Exception as e:
            print(f"Parse Error: {str(e)}")
            raise

    def _fallback_analysis(self, flag_data: Dict[str, Any]) -> Dict[str, Any]:
        scope = flag_data.get("scope", "").lower()
        code_changes = flag_data.get("code_changes", "").lower()
        description = flag_data.get("description", "").lower()
        name = flag_data.get("name", "").lower()

        all_text = f"{name} {scope} {code_changes} {description}"

        print(f"\nFallback Analysis: {name}")
        print(f"Scope: {scope}")

        critical_keywords = {
            "payment": 35, "billing": 35, "delete user": 40, "delete data": 35,
            "drop table": 45, "production data": 40, "user password": 35, "credit card": 40,
        }

        high_risk_keywords = {
            "authentication": 25, "security": 25, "database schema": 25, "migration": 25,
            "alter table": 28, "oauth": 20, "redis": 12, "cache": 10,
        }

        medium_risk_keywords = {
            "database": 15, "sql": 15, "backend api": 12, "third-party service": 12,
            "external api": 12, "webhook": 10, "ml model": 15, "tensorflow": 12, "algorithm": 12,
        }

        routine_keywords = {
            "api": 5, "backend": 4, "integration": 8, "email": 6, "notification": 5,
            "template": 3, "user": 3, "data": 3, "retry": 4, "queue": 6, "async": 5,
        }

        detected_issues = []
        risk_score = 10

        critical_found = high_found = medium_found = routine_found = 0

        for keyword, weight in critical_keywords.items():
            if keyword in all_text:
                detected_issues.append(f"critical_{keyword.replace(' ', '_')}")
                risk_score += weight
                critical_found += 1
                print(f"  CRITICAL: '{keyword}' → +{weight}")

        for keyword, weight in high_risk_keywords.items():
            if keyword in all_text:
                detected_issues.append(f"high_{keyword.replace(' ', '_')}")
                risk_score += weight
                high_found += 1
                print(f"  HIGH: '{keyword}' → +{weight}")

        for keyword, weight in medium_risk_keywords.items():
            if keyword in all_text:
                detected_issues.append(f"medium_{keyword.replace(' ', '_')}")
                risk_score += weight
                medium_found += 1
                print(f"  MEDIUM: '{keyword}' → +{weight}")

        for keyword, weight in routine_keywords.items():
            if keyword in all_text:
                detected_issues.append(f"routine_{keyword.replace(' ', '_')}")
                risk_score += weight
                routine_found += 1

        if scope in ["all", "all systems"]:
            risk_score += 15
            detected_issues.append("affects_all_systems")
        elif scope == "database":
            risk_score += 20
            detected_issues.append("database_scope")

        risk_score = min(risk_score, 100)

        print(f"  Final Score: {risk_score}/100")

        if risk_score >= 75:
            risk_level = "critical"
            recommendation = "Requires CTO approval and full security review"
        elif risk_score >= 60:
            risk_level = "high"
            recommendation = "Requires engineering manager and senior engineer approval"
        elif risk_score >= 30:
            risk_level = "medium"
            recommendation = "Requires senior engineer approval"
        else:
            risk_level = "low"
            recommendation = "Can be approved by team lead"

        print(f"  Risk Level: {risk_level.upper()}\n")

        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "detected_issues": detected_issues if detected_issues else ["routine_change"],
            "ai_reasoning": f"Fallback analysis: {critical_found} critical, {high_found} high, {medium_found} medium, {routine_found} routine keywords detected.",
            "recommendation": recommendation
        }
