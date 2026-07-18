/**
 * DS re-export shim. The prototype JSX components lack TS types, so consumers
 * import from here to get permissively-typed React components. This isolates
 * the `any` cast to one place instead of at every call site.
 */
type C = (props: Record<string, unknown>) => React.ReactNode;
import type React from "react";

import { CompetitionBadge as _CompetitionBadge } from "./CompetitionBadge";
import { FactorBar as _FactorBar } from "./FactorBar";
import { FixtureGroup as _FixtureGroup } from "./FixtureGroup";
import { FollowButton as _FollowButton } from "./FollowButton";
import { FormPills as _FormPills } from "./FormPills";
import { LeagueTable as _LeagueTable } from "./LeagueTable";
import { MatchRow as _MatchRow } from "./MatchRow";
import { PlayerCard as _PlayerCard } from "./PlayerCard";
import { PlayerStatRow as _PlayerStatRow } from "./PlayerStatRow";
import { ProbabilityBar as _ProbabilityBar } from "./ProbabilityBar";
import { RatingRing as _RatingRing } from "./RatingRing";
import { ScorelineGrid as _ScorelineGrid } from "./ScorelineGrid";
import { SectionHeading as _SectionHeading } from "./SectionHeading";
import { StatCard as _StatCard } from "./StatCard";

export const CompetitionBadge = _CompetitionBadge as C;
export const FactorBar = _FactorBar as C;
export const FixtureGroup = _FixtureGroup as C;
export const FollowButton = _FollowButton as C;
export const FormPills = _FormPills as C;
export const LeagueTable = _LeagueTable as C;
export const MatchRow = _MatchRow as C;
export const PlayerCard = _PlayerCard as C;
export const PlayerStatRow = _PlayerStatRow as C;
export const ProbabilityBar = _ProbabilityBar as C;
export const RatingRing = _RatingRing as C;
export const ScorelineGrid = _ScorelineGrid as C;
export const SectionHeading = _SectionHeading as C;
export const StatCard = _StatCard as C;
