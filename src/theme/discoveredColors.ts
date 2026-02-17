export type DiscoveredVarColor = {
  token: string;
  usedIn: string[];
};

export type DiscoveredLiteralColor = {
  value: string;
  usedIn: string[];
};

export type DiscoveredTokenizedFallbackColor = {
  token: string;
  value: string;
  usedIn: string[];
};

export const DISCOVERED_MISSING_VAR_COLORS: DiscoveredVarColor[] = [
  {
    "token": "--border",
    "usedIn": [
      "src/components/StyledTable.css:2"
    ]
  },
  {
    "token": "--button-accent-1",
    "usedIn": [
      "src/components/Button.css:131",
      "src/components/Button.css:52",
      "src/index.css:26"
    ]
  },
  {
    "token": "--button-accent-2",
    "usedIn": [
      "src/components/Button.css:135",
      "src/index.css:27"
    ]
  },
  {
    "token": "--button-accent-3",
    "usedIn": [
      "src/components/Button.css:139",
      "src/index.css:28"
    ]
  },
  {
    "token": "--button-accent-4",
    "usedIn": [
      "src/components/Button.css:143",
      "src/index.css:29"
    ]
  },
  {
    "token": "--button-accent-5",
    "usedIn": [
      "src/components/Button.css:147",
      "src/index.css:30"
    ]
  },
  {
    "token": "--button-accent-6",
    "usedIn": [
      "src/components/Button.css:151",
      "src/index.css:31"
    ]
  },
  {
    "token": "--button-accent-gradient",
    "usedIn": [
      "src/components/Button.css:187"
    ]
  },
  {
    "token": "--button-bg",
    "usedIn": [
      "src/components/Button.css:10",
      "src/components/Button.css:45",
      "src/components/Button.css:78"
    ]
  },
  {
    "token": "--button-fg",
    "usedIn": [
      "src/components/Button.css:14",
      "src/components/Button.css:265",
      "src/components/Button.css:46"
    ]
  },
  {
    "token": "--ds-color-dot-border",
    "usedIn": [
      "src/index.css:97"
    ]
  },
  {
    "token": "--ds-color-dot-color",
    "usedIn": [
      "src/index.css:96"
    ]
  },
  {
    "token": "--ds-color-dot-gap",
    "usedIn": [
      "src/index.css:102"
    ]
  },
  {
    "token": "--ds-color-dot-left-section-width",
    "usedIn": [
      "src/index.css:106",
      "src/index.css:110"
    ]
  },
  {
    "token": "--ds-color-dot-size",
    "usedIn": [
      "src/index.css:93",
      "src/index.css:94"
    ]
  },
  {
    "token": "--surface",
    "usedIn": [
      "src/components/BusinessSetupFlow.tsx:178",
      "src/index.css:45",
      "src/index.css:60"
    ]
  },
  {
    "token": "--white",
    "usedIn": [
      "src/index.css:79",
      "src/index.css:89"
    ]
  }
];

export const DISCOVERED_LITERAL_COLORS: DiscoveredLiteralColor[] = [
  {
    "value": "#000000",
    "usedIn": [
      "src/pages/Departments.tsx:107",
      "src/pages/UiPalette.tsx:104"
    ]
  },
  {
    "value": "#e6e6e6",
    "usedIn": [
      "src/pages/UiPalette.css:49",
      "src/pages/UiPalette.css:50",
      "src/pages/UiPalette.css:51",
      "src/pages/UiPalette.css:52"
    ]
  },
  {
    "value": "#ffffff",
    "usedIn": [
      "src/pages/Departments.tsx:106",
      "src/pages/UiPalette.tsx:103"
    ]
  },
  {
    "value": "hsla(0, 0%, 0%, 0.1)",
    "usedIn": [
      "src/components/AppSidesheet.css:33"
    ]
  },
  {
    "value": "hsla(0, 0%, 0%, 0.3)",
    "usedIn": [
      "src/components/AppSidesheet.css:20",
      "src/components/AppSidesheet.css:7"
    ]
  },
  {
    "value": "rgba(0, 0, 0, 0.08)",
    "usedIn": [
      "src/pages/PublicContractView.css:20",
      "src/pages/SalesOrder.css:177",
      "src/pages/SalesOrderContract.css:19",
      "src/pages/SalesOrderInvoice.css:23"
    ]
  },
  {
    "value": "rgba(0, 0, 0, 0.1)",
    "usedIn": [
      "src/components/DebugOverlay.css:40",
      "src/components/InlineEditableField.css:129"
    ]
  },
  {
    "value": "rgba(0, 0, 0, 0.15)",
    "usedIn": [
      "src/components/DebugOverlay.css:7"
    ]
  },
  {
    "value": "rgba(0, 0, 0, 0.18)",
    "usedIn": [
      "src/index.css:36"
    ]
  },
  {
    "value": "rgba(0, 0, 0, 0.3)",
    "usedIn": [
      "src/components/DebugOverlay.tsx:241"
    ]
  },
  {
    "value": "rgba(0, 0, 0, 0.5)",
    "usedIn": [
      "src/components/Button.css:65",
      "src/components/Button.css:74"
    ]
  },
  {
    "value": "rgba(217, 217, 217, 0.3)",
    "usedIn": [
      "src/components/Button.css:94"
    ]
  },
  {
    "value": "rgba(217, 217, 217, 0)",
    "usedIn": [
      "src/components/Button.css:93"
    ]
  }
];

export const DISCOVERED_TOKENIZED_FALLBACK_COLORS: DiscoveredTokenizedFallbackColor[] = [];
