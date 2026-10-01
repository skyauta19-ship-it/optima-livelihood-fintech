import { useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarPlus,
  CheckCircle,
  MapPin,
  Plus,
  Scissors,
  Storefront,
  Sun,
  Target,
  Tree,
  TrendUp,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn, formatCurrency, formatShortDate } from "@/lib/utils";
import type { LivelihoodProject, ProjectStatus } from "@/types";

type NewProjectInput = Pick<
  LivelihoodProject,
  "name" | "category" | "location" | "goal" | "monthlyReturn" | "deadline" | "summary"
>;

const ALL = "All categories";

function categoryIcon(category: string): ReactNode {
  const key = category.toLowerCase();
  if (key.includes("farm") || key.includes("agri") || key.includes("tree"))
    return <Tree size={18} weight="duotone" />;
  if (key.includes("tailor") || key.includes("garment") || key.includes("textile"))
    return <Scissors size={18} weight="duotone" />;
  if (key.includes("bakery") || key.includes("food") || key.includes("solar"))
    return <Sun size={18} weight="duotone" />;
  return <Storefront size={18} weight="duotone" />;
}

const STATUS_STYLES: Record<ProjectStatus, string> = {
  Planning: "bg-muted text-muted-foreground",
  "In Progress": "bg-secondary text-secondary-foreground",
  Completed: "bg-primary text-primary-foreground",
};

interface LivelihoodProjectsProps {
  projects: LivelihoodProject[];
  walletBalance: number;
  onCreate: (input: NewProjectInput) => void;
  onContribute: (projectId: string, amount: number) => void;
}

export function LivelihoodProjects({
  projects,
  walletBalance,
  onCreate,
  onContribute,
}: LivelihoodProjectsProps) {
  const reduced = useReducedMotion() ?? false;
  const [filter, setFilter] = useState(ALL);
  const [createOpen, setCreateOpen] = useState(false);
  const [contributeTarget, setContributeTarget] = useState<LivelihoodProject | null>(null);
  const [amount, setAmount] = useState("250");

  const [draft, setDraft] = useState({
    name: "",
    category: "",
    location: "",
    goal: "",
    monthlyReturn: "",
    deadline: "",
    summary: "",
  });

  const categories = useMemo(
    () => Array.from(new Set(projects.map((project) => project.category))),
    [projects],
  );

  const visible = useMemo(
    () => (filter === ALL ? projects : projects.filter((p) => p.category === filter)),
    [filter, projects],
  );

  const totalGoal = projects.reduce((total, project) => total + project.goal, 0);
  const totalSaved = projects.reduce((total, project) => total + project.saved, 0);
  const monthlyReturn = projects.reduce((total, project) => total + project.monthlyReturn, 0);

  const activeFilter = filter !== ALL && !categories.includes(filter) ? ALL : filter;

  const openCreate = () => {
    setDraft({
      name: "",
      category: categories[0] ?? "",
      location: "",
      goal: "",
      monthlyReturn: "",
      deadline: "",
      summary: "",
    });
    setCreateOpen(true);
  };

  const submitCreate = () => {
    const goal = Number(draft.goal);
    if (!draft.name.trim()) {
      toast.error("Add a project name before saving.");
      return;
    }
    if (!Number.isFinite(goal) || goal <= 0) {
      toast.error("Enter a target budget greater than zero.");
      return;
    }
    onCreate({
      name: draft.name.trim(),
      category: draft.category || categories[0] || "Artisan & Retail",
      location: draft.location.trim() || "Cooperative branch",
      goal,
      monthlyReturn: Number(draft.monthlyReturn) || Math.round(goal * 0.14),
      deadline: draft.deadline || new Date(Date.now() + 1000 * 60 * 60 * 24 * 120)
        .toISOString()
        .slice(0, 10),
      summary:
        draft.summary.trim() ||
        "New livelihood activity submitted for committee review and savings allocation.",
    });
    setCreateOpen(false);
  };

  const submitContribution = () => {
    if (!contributeTarget) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    if (value > walletBalance) {
      toast.error("That is more than your available savings balance.");
      return;
    }
    onContribute(contributeTarget.id, value);
    setContributeTarget(null);
  };

  const container = reduced ? {} : { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item = reduced
    ? {}
    : { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div
      variants={container}
      initial={reduced ? false : "hidden"}
      animate="show"
      className="space-y-6"
    >
      <motion.section variants={item} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Project manager
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Livelihood projects</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {projects.length} active activities with {formatCurrency(totalSaved)} allocated
            against {formatCurrency(totalGoal)} in targets, returning about{" "}
            {formatCurrency(monthlyReturn)} per month.
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-full">
          <Plus size={16} weight="bold" /> New livelihood project
        </Button>
      </motion.section>

      <motion.section variants={item} className="flex flex-wrap items-center gap-2">
        {[ALL, ...categories].map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setFilter(category)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              activeFilter === category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {category === ALL ? <Target size={14} weight="bold" /> : categoryIcon(category)}
            {category}
          </button>
        ))}
      </motion.section>

      {visible.length === 0 ? (
        <motion.section
          variants={item}
          className="card-surface flex flex-col items-center gap-3 p-12 text-center"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
            <Storefront size={22} weight="duotone" />
          </span>
          <p className="font-display text-lg">No projects in this category yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create a project to start tracking savings, milestones and monthly returns for
            your group.
          </p>
          <Button variant="outline" className="rounded-full" onClick={openCreate}>
            <Plus size={15} weight="bold" /> Create a project
          </Button>
        </motion.section>
      ) : (
        <motion.section variants={item} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((project) => {
            const progress = Math.min(
              Math.round((project.saved / Math.max(project.goal, 1)) * 100),
              100,
            );
            return (
              <article
                key={project.id}
                className="tile-hover flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                    {categoryIcon(project.category)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-display text-base font-semibold tracking-tight">
                      {project.name}
                    </h2>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin size={12} weight="bold" /> {project.location}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "shrink-0 rounded-full border-0 text-[11px]",
                      STATUS_STYLES[project.status],
                    )}
                  >
                    {project.status}
                  </Badge>
                </div>

                <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                  {project.summary}
                </p>

                <div className="mt-4">
                  <div className="flex items-end justify-between text-xs">
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(project.saved)}
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        of {formatCurrency(project.goal)}
                      </span>
                    </span>
                    <span className="font-semibold text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="mt-2 h-2" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-border bg-background/60 p-2.5">
                    <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      <TrendUp size={12} weight="bold" /> Monthly return
                    </p>
                    <p className="mt-1 font-semibold tabular-nums">
                      {formatCurrency(project.monthlyReturn)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/60 p-2.5">
                    <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      <CalendarPlus size={12} weight="bold" /> Target date
                    </p>
                    <p className="mt-1 font-semibold tabular-nums">
                      {formatShortDate(project.deadline)}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-1.5">
                  {project.milestones.slice(0, 3).map((milestone) => (
                    <li key={milestone.label} className="flex items-center gap-2 text-xs">
                      {milestone.done ? (
                        <CheckCircle size={14} weight="fill" className="text-primary" />
                      ) : (
                        <span className="size-3.5 rounded-full border border-muted-foreground/50" />
                      )}
                      <span
                        className={cn(
                          "truncate",
                          milestone.done ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {milestone.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="outline"
                  className="mt-5 w-full rounded-full"
                  onClick={() => {
                    setAmount("250");
                    setContributeTarget(project);
                  }}
                >
                  Contribute savings
                </Button>
              </article>
            );
          })}
        </motion.section>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">New livelihood project</DialogTitle>
            <DialogDescription>
              Register the activity so savings allocations and funding requests can be tracked
              against it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                value={draft.name}
                placeholder="Solar Bakery Collective"
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={draft.category}
                  onValueChange={(value) => setDraft({ ...draft, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-location">Location</Label>
                <Input
                  id="project-location"
                  value={draft.location}
                  placeholder="Market Row, Zone 4"
                  onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="project-goal">Target budget</Label>
                <Input
                  id="project-goal"
                  inputMode="numeric"
                  value={draft.goal}
                  placeholder="3800"
                  onChange={(event) => setDraft({ ...draft, goal: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-return">Monthly return</Label>
                <Input
                  id="project-return"
                  inputMode="numeric"
                  value={draft.monthlyReturn}
                  placeholder="640"
                  onChange={(event) =>
                    setDraft({ ...draft, monthlyReturn: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-deadline">Target date</Label>
                <Input
                  id="project-deadline"
                  type="date"
                  value={draft.deadline}
                  onChange={(event) => setDraft({ ...draft, deadline: event.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-summary">Activity summary</Label>
              <Textarea
                id="project-summary"
                rows={3}
                value={draft.summary}
                placeholder="What the group will produce, who buys it, and how the loan is repaid."
                onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" className="rounded-full" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button className="rounded-full" onClick={submitCreate}>
                Save project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={contributeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setContributeTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Contribute savings</DialogTitle>
            <DialogDescription>
              Allocate from your available balance of {formatCurrency(walletBalance)} to{" "}
              {contributeTarget?.name ?? "this project"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contribution-amount">Amount</Label>
              <Input
                id="contribution-amount"
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[100, 250, 500, 1000].map((quick) => (
                <Button
                  key={quick}
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setAmount(String(quick))}
                >
                  {formatCurrency(quick)}
                </Button>
              ))}
            </div>
            {contributeTarget && (
              <p className="text-xs text-muted-foreground">
                Remaining target:{" "}
                {formatCurrency(Math.max(contributeTarget.goal - contributeTarget.saved, 0))}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => setContributeTarget(null)}
              >
                Cancel
              </Button>
              <Button className="rounded-full" onClick={submitContribution}>
                Allocate funds
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}