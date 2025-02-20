export interface User {
  uid: string;
  email: string;
  displayName?: string | null;
  role: UserRoles;
}

export enum UserRoles {
  ADMIN = 'admin',
  USER = 'user',
}

export interface UserSettings {
  orgId: string;
  clientId: string;
  clientSecret: string;
  active_subscription?: boolean;
  organizationName?: string;
}

export type ReactorAPIResponse = {
  data: Array<{
    id: string;
    type: string;
    attributes: {
      created_at: string;
      name: string;
      orgId: string;
      updated_at: string;
      token: string;
      created_by_email: string;
      created_by_display_name: string;
      updated_by_email: string;
      updated_by_display_name: string;
      url?: string; // for callbacks only
      display_name?: string; // for extensions only
      settings?: string;
      delegate_descriptor_id?: string;
      state?: string; // for libraries only
      published_at?: string; // for libraries only
    };
    relationships: {
      properties: {
        links: {
          related: string;
        };
      };
      entitlements: {
        links: {
          related: string;
        };
      };
    };
    links: {
      self: string;
      properties: string;
      entitlements: string;
    };
    meta: {
      rights: string[];
      platform_rights: {
        web: string[];
        mobile: string[];
      };
    };
  }>;
  meta: {
    pagination: {
      current_page: number;
      next_page: number | null;
      prev_page: number | null;
      total_pages: number;
      total_count: number;
    };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
};

// First, let's define the type for an item in the data array
type ReactorAPIResponseItem = ReactorAPIResponse['data'][0];

// Now, let's create a new type that picks only id and attributes
export type TruncatedReactorAPIResponseItem = Pick<ReactorAPIResponseItem, 'id' | 'attributes' | 'type'>;




export interface AuditEvent {
  data: {
    attributes: {
      attributed_to_display_name: string;
      attributed_to_email: string;
      created_at: string;
      display_name: string;
      entity: string; // JSON string containing the entity object
      type_of: string;
      updated_at: string;
    };
    id: string;
    links: {
      entity: string;
      property: string;
      self: string;
    };
    meta: {
      property_name: string;
    };
    relationships: {
      entity: {
        data: {
          id: string;
          type: string;
        };
        links: {
          related: string;
        };
      };
      property: {
        data: {
          id: string;
          type: string;
        };
        links: {
          related: string;
        };
      };
    };
    type: string;
  };
}

export interface Entity {
  data: {
    id: string;
    type: string;
    attributes: {
      archive: boolean;
      created_at: string;
      library_path: string;
      library_name: string;
      library_entry_points: Array<{
        library_name: string;
        minified: boolean;
        references: string[];
        license_path?: string;
      }>;
      name: string;
      path: string;
      stage: string;
      updated_at: string;
      status: string;
      token: string;
      created_by_email: string;
      created_by_display_name: string;
      updated_by_email: string;
      updated_by_display_name: string;
    };
    relationships: {
      library: {
        links: {
          related: string;
        };
        data: {
          id: string;
          type: string;
        };
      };
      builds: {
        links: {
          related: string;
        };
      };
      host: {
        links: {
          related: string;
          self: string;
        };
        data: {
          id: string;
          type: string;
        };
      };
      property: {
        links: {
          related: string;
        };
        data: {
          id: string;
          type: string;
        };
      };
    };
    links: {
      property: string;
      self: string;
    };
    meta: {
      archive_encrypted: boolean;
      script_sources: Array<{
        hosting_region: string;
        minified: string;
        license_path: string;
        debug: string;
      }>;
    };
  };
}

interface Links {
  property?: string;
  origin?: string;
  self?: string;
  extension?: string;
}

interface LinkData {
  links: {
    related: string;
  };
  data?: {
    id: string;
    type: string;
  };
}

interface Relationships {
  libraries: LinkData;
  revisions: LinkData;
  notes: LinkData;
  property: LinkData;
  origin: LinkData;
  extension: LinkData;
  updated_with_extension_package: LinkData;
  updated_with_extension: LinkData;
}

interface SearchResponseItemAttributes {
  created_at: string;
  deleted_at: string | null;
  dirty: boolean;
  enabled: boolean;
  name: string;
  published: boolean;
  published_at: string | null;
  revision_number: number;
  updated_at: string;
  clean_text: boolean;
  default_value: string | null;
  delegate_descriptor_id: string;
  force_lower_case: boolean;
  review_status: string;
  storage_duration: string | null;
  settings: string;
}

export interface SearchResponseItem {
  id: string;
  type: string;
  attributes: SearchResponseItemAttributes;
  relationships?: Relationships;
  links?: Links;
  meta: {
    latest_revision_number?: number;
    match_score?: number;
  };
}

export interface SearchApiResponse {
  data: SearchResponseItem[];
  meta: {
    total_hits: number;
  };
}

export const searchResources = [
  'audit_events',
  // 'builds',
  'callbacks',
  'data_elements',
  'environments',
  // 'extension_packages',
  'extensions',
  'hosts',
  'libraries',
  'rule_components',
  'rules'
];

export type SearchResource = typeof searchResources[number];

export interface AuditEventSearchResponseItem {
  id: `AE${string}`;
  type: 'audit_events';
  attributes: {
    attributed_to_display_name: string;
    attributed_to_email: string;
    created_at: string;
    display_name: string;
    type_of: string;
    updated_at: string;
    entity: string;
  };
  meta: {
    match_score: number;
  };
}

export interface CallbackSearchResponseItem {
  id: `CB${string}`;
  type: 'callbacks';
  attributes: {
    created_at: string;
    subscriptions: string[];
    updated_at: string;
    url: string;
    created_by_email: string;
    created_by_display_name: string;
    updated_by_email: string;
    updated_by_display_name: string;
  };
  meta: {
    match_score: number;
  };
}

export interface DataElementSearchResponseItem {
  id: `DE${string}`;
  type: 'data_elements';
  attributes: {
    created_at: string;
    deleted_at: string | null;
    dirty: boolean;
    enabled: boolean;
    name: string;
    published: boolean;
    published_at: string | null;
    revision_number: number;
    updated_at: string;
    created_by_email: string;
    created_by_display_name: string;
    updated_by_email: string;
    updated_by_display_name: string;
    clean_text: boolean;
    default_value: string | null;
    delegate_descriptor_id: string;
    force_lower_case: boolean;
    review_status: string;
    storage_duration: string | null;
    settings: string;
  },
  relationships: {
    property: {
      data: {
        id: string;
      }
    }
  },
  meta: {
    match_score: number;
  },
};

export interface EnvironmentSearchResponseItem {
  id: `EN${string}`;
  type: 'environments';
  attributes: {
    archive: boolean;
    created_at: string;
    library_path: string;
    library_name: string;
    library_entry_points: {
      library_name: string;
      minified: boolean;
      references: string[];
      license_path?: string;
    }[];
    name: string;
    path: string;
    stage: string;
    updated_at: string;
    status: string;
    token: string;
    created_by_email: string;
    created_by_display_name: string;
    updated_by_email: string;
    updated_by_display_name: string;
  },
  meta: {
    match_score: number;
  },
}

export interface ExtensionSearchResponseItem {
  id: `EX${string}`;
  type: 'extensions';
  attributes: {
    created_at: string;
    deleted_at: string | null;
    dirty: boolean;
    enabled: boolean;
    name: string;
    published: boolean;
    published_at: string | null;
    revision_number: number;
    updated_at: string;
    created_by_email: string;
    created_by_display_name: string;
    updated_by_email: string;
    updated_by_display_name: string;
    delegate_descriptor_id: string;
    display_name: string;
    review_status: string;
    version: string;
    settings: string;
  },
  relationships: {
    property: {
      data: {
        id: string;
      }
    }
  },
  meta: {
    match_score: number;
  },
}

export interface HostSearchResponseItem {
  id: `HT${string}`;
  type: 'hosts';
  attributes: {
    created_at: string;
    server: null | string;
    name: string;
    path: string | null;
    port: null | number;
    status: string;
    type_of: string;
    updated_at: string;
    username: null | string;
  },
  meta: {
    match_score: number;
  },
}

export interface LibrarySearchResponseItem {
  id: `LB${string}`;
  type: 'libraries';
  attributes: {
    created_at: string;
    name: string;
    published_at: string | null;
    state: string;
    updated_at: string;
    created_by_email: string;
    created_by_display_name: string;
    updated_by_email: string;
    updated_by_display_name: string;
    build_required: boolean;
  },
  meta: {
    match_score: number;
  },
}

export interface RuleComponentSearchResponseItem {
  id: `RC${string}`;
  type: 'rule_components';
  attributes: {
    created_at: string;
    delegate_descriptor_id: string;
    deleted_at: string | null;
    dirty: boolean;
    enabled: boolean;
    extension_id: string;
    extension_name: string;
    extension_package_id: string;
    extension_package_name: string;
    name: string;
    negate: boolean;
    order: number;
    published: boolean;
    revision_number: number;
    rule_order: number;
    settings: string;
    timeout: number;
    updated_at: string;
    updated_by_display_name: string;
  },
  relationships: {
    property: {
      data: {
        id: string;
      }
    },
    rule: {
      data: {
        id: string;
      }
    }
  },
  meta: {
    match_score: number;
  },
}

export interface RuleSearchResponseItem {
  id: `RL${string}`;
  type: 'rules';
  attributes: {
    created_at: string;
    deleted_at: string | null;
    dirty: boolean;
    enabled: boolean;
    name: string;
    published: boolean;
    published_at: string | null;
    revision_number: number;
    updated_at: string;
    created_by_email: string;
    created_by_display_name: string;
    updated_by_email: string;
    updated_by_display_name: string;
    review_status: string;
  },
  relationships: {
    property: {
      data: {
        id: string;
      }
    }
  },
  meta: {
    match_score: number;
  },
}

export interface CalendarItem {
  id: string;
  attributes: {
    published_at: string | null;
    state: string;
    name: string;
    created_by_display_name: string;
  };
}

export interface MonthViewCalendarProps {
  items: CalendarItem[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}