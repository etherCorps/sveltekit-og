/**
 * MDX globals registry — components available inside MDX without `import`.
 * Wired via `<Content components={components} />` in `[...slug].astro`.
 * Add new components here as you build (or install) them.
 */

import { Aside } from "./components/ui/aside";
import Render from "./components/Render.astro";
import { Card } from "./components/ui/card";
import { CardGrid } from "./components/ui/card-grid";
import { PackageManagers } from "./components/ui/package-managers";
import { Step, Steps } from "./components/ui/steps";
import { Tabs, TabItem } from "./components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./components/ui/collapsible";
import PropField from "./components/docs/PropField.astro";
import RepoLink from "./components/docs/RepoLink.astro";
import ReleaseInfo from "./components/docs/ReleaseInfo.astro";

export const components = {
  Aside,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  PropField,
  RepoLink,
  ReleaseInfo,
  Card,
  CardGrid,
  PackageManagers,
  Render,
  Step,
  Steps,
  TabItem,
  Tabs,
};
