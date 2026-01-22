import os
import json
from typing import Dict, Any
from openai import OpenAI

class AIRiskAnalyzer:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key == "fake-key-for-testing":
            print("⚠️ Using fake API key, will use fallback analysis")
            self.client = None
        else:
            try:
                self.client = OpenAI(api_key=api_key)
            except Exception as e:
                print(f"Failed to initialize OpenAI client: {e}")
                self.client = None

    def analyze_feature_flag(self, flag_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.client:
            print("🔄 No valid OpenAI client, using fallback analysis")
            return self._fallback_analysis(flag_data)

        try:
            prompt = f"""You are an expert software engineering risk analyst. Analyze the following feature flag submission:

Feature Flag Details:
- Name: {flag_data.get("name", "")}
- Description: {flag_data.get("description", "")}
- Scope: {flag_data.get("scope", "")}
- Code Changes: {flag_data.get("code_changes", "")}
- Configuration: {json.dumps(flag_data.get("config", {}))}

Respond ONLY with valid JSON:
{{
    "risk_level": "low|medium|high|critical",
    "risk_score": 0-100,
    "detected_issues": ["issue1", "issue2"],
    "ai_reasoning": "detailed explanation",
    "recommendation": "approval recommendation"
}}"""

            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert software engineering risk analyst."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )

            result_text = response.choices[0].message.content
            result = self._parse_response(result_text)
            print("✅ AI analysis successful")
            return result

        except Exception as e:
            print(f"❌ AI Analysis Error: {str(e)}")
            return self._fallback_analysis(flag_data)

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        try:
            clean_text = response_text.strip()
            if clean_text.startswith("```"):
                clean_text = clean_text.split("```")[1]
                if clean_text.startswith("json"):
                    clean_text = clean_text[4:]

            result = json.loads(clean_text)

            required_fields = ["risk_level", "risk_score", "detected_issues", "ai_reasoning", "recommendation"]
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Missing required field: {field}")

            return result

        except Exception as e:
            print(f"Parse Error: {str(e)}")
            raise

    def _fallback_analysis(self, flag_data: Dict[str, Any]) -> Dict[str, Any]:
        scope = flag_data.get("scope", "").lower()
        code_changes = flag_data.get("code_changes", "").lower()
        description = flag_data.get("description", "").lower()
        name = flag_data.get("name", "").lower()

        all_text = f"{name} {scope} {code_changes} {description}"

        print(f"\n🔍 Analyzing: {name}")
        print(f"📝 Scope: {scope}")

        #  Critical:
        critical_keywords = {
            "payment": 35,
            "billing": 35,
            "delete user": 40,
            "delete data": 35,
            "drop table": 45,
            "production data": 40,
            "user password": 35,
            "credit card": 40,
        }

        #  High:
        high_risk_keywords = {
            "authentication": 25,
            "security": 25,
            "database schema": 25,
            "migration": 25,
            "alter table": 28,
            "oauth": 20,
            "redis": 12,
            "cache": 10,
        }

        #  Medium:
        medium_risk_keywords = {
            "database": 15,
            "sql": 15,
            "backend api": 12,
            "third-party service": 12,
            "external api": 12,
            "webhook": 10,
            "ml model": 15,
            "tensorflow": 12,
            "algorithm": 12,
        }

        #  Low-Medium:
        routine_keywords = {
            "api": 5,
            "backend": 4,
            "integration": 8,
            "email": 6,
            "notification": 5,
            "template": 3,
            "user": 3,
            "data": 3,
            "retry": 4,
            "queue": 6,
            "async": 5,
        }

        detected_issues = []
        risk_score = 10

        critical_found = 0
        high_found = 0
        medium_found = 0
        routine_found = 0

        for keyword, weight in critical_keywords.items():
            if keyword in all_text:
                detected_issues.append(f"critical_{keyword.replace(' ', '_')}")
                risk_score += weight
                critical_found += 1
                print(f"   CRITICAL: '{keyword}' → +{weight} (total: {risk_score})")

        for keyword, weight in high_risk_keywords.items():
            if keyword in all_text:
                detected_issues.append(f"high_{keyword.replace(' ', '_')}")
                risk_score += weight
                high_found += 1
                print(f"   HIGH: '{keyword}' → +{weight} (total: {risk_score})")

        for keyword, weight in medium_risk_keywords.items():
            if keyword in all_text:
                detected_issues.append(f"medium_{keyword.replace(' ', '_')}")
                risk_score += weight
                medium_found += 1
                print(f"   MEDIUM: '{keyword}' → +{weight} (total: {risk_score})")

        for keyword, weight in routine_keywords.items():
            if keyword in all_text:
                detected_issues.append(f"routine_{keyword.replace(' ', '_')}")
                risk_score += weight
                routine_found += 1
                print(f"   ROUTINE: '{keyword}' → +{weight} (total: {risk_score})")

        # Scope 影响
        if scope == "all" or scope == "all systems":
            risk_score += 15
            detected_issues.append("affects_all_systems")
            print(f"   Scope 'all systems' → +15 (total: {risk_score})")
        elif scope == "database":
            risk_score += 20
            detected_issues.append("database_scope")
            print(f"   Scope 'database' → +20 (total: {risk_score})")

        risk_score = min(risk_score, 100)

        print(f"\n   Summary:")
        print(f"     Critical keywords: {critical_found}")
        print(f"     High keywords: {high_found}")
        print(f"     Medium keywords: {medium_found}")
        print(f"     Routine keywords: {routine_found}")
        print(f"     Final Score: {risk_score}/100")

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
