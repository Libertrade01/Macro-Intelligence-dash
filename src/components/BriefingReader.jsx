import { getBriefingStyleId } from "../lib/briefing-styles";
import DefaultBriefingReader from "./briefing-styles/DefaultBriefingReader";
import MacroBriefingReader from "./briefing-styles/MacroBriefingReader";
import MacroContentReader from "./briefing-styles/MacroContentReader";

export default function BriefingReader({ briefing }) {
  const styleId = getBriefingStyleId(briefing.type);

  if (styleId === "desk-dashboard") {
    return <MacroBriefingReader briefing={briefing} />;
  }

  if (styleId === "macro-content") {
    return <MacroContentReader briefing={briefing} />;
  }

  return <DefaultBriefingReader briefing={briefing} />;
}
