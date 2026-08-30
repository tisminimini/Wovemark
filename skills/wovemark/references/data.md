# Data Engine, Forms & CRUD Reference

## 1. Declaring Data Sources (`::data`)

```md
::data id="users" src="/api/users" autoRefresh=30
```

State automatically maintained for each source:
- `users`: Data array or object
- `$users.status`: `'idle'` | `'loading'` | `'success'` | `'error'`
- `$users.error`: Error string or null
- `$users.lastUpdated`: Timestamp

## 2. Interactive Data Table (`:::data-table`)

```md
:::data-table source="users" searchable=true sortable=true pagination=true pageSize=10
::column field="name" label="Full Name"
::column field="email" label="Email Address"
::column field="role" label="Role"
::column field="status" label="Status"
:::
```

## 3. Forms (`:::form`)

```md
:::form id="create-user" submit="POST /api/users" success="refresh:users; toast:User created; close:create-modal"
::field name="name" label="Full Name" type="text" required=true placeholder="Alice Smith"
::field name="email" label="Email Address" type="email" required=true placeholder="alice@example.com"
::field name="role" label="Role" type="select" options="Admin, Editor, Viewer" required=true
::button label="Create User" type="submit" variant="primary"
:::
```

## 4. Modal Dialogs (`:::dialog`)

```md
:::dialog id="create-modal" title="Create New User" description="Enter user details below." size="md"
:::form submit="POST /api/users" success="refresh:users; toast:User created!; close:create-modal"
::field name="name" label="Name" required=true
::field name="email" label="Email" type="email" required=true
::button label="Save Record" type="submit" variant="primary"
:::
:::
```

## 5. Actions Whitelist
- `open:<dialog-id>`
- `close:<dialog-id>`
- `toggle:<id>`
- `refresh:<source-id>`
- `navigate:<hash-route>`
- `submit:<form-id>`
- `delete:<source-id>?id={{item.id}}`
- `toast:<message>?type=success|danger|warning|info`
- `theme:toggle` | `theme:dark` | `theme:light`
- `copy:<text>`
