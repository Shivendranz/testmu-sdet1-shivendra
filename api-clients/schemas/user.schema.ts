export const userListSchema = {
  type: 'object',
  required: ['page', 'per_page', 'total', 'total_pages', 'data'],
  properties: {
    page: { type: 'number' },
    per_page: { type: 'number' },
    total: { type: 'number' },
    total_pages: { type: 'number' },
    data: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'email', 'first_name', 'last_name', 'avatar'],
        properties: {
          id: { type: 'number' },
          email: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          avatar: { type: 'string' },
        },
      },
    },
  },
} as const;

export const userSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['id', 'email', 'first_name', 'last_name', 'avatar'],
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        avatar: { type: 'string' },
      },
    },
  },
} as const;

export const createdUserSchema = {
  type: 'object',
  required: ['name', 'job', 'id', 'createdAt'],
  properties: {
    name: { type: 'string' },
    job: { type: 'string' },
    id: { type: 'string' },
    createdAt: { type: 'string' },
  },
} as const;

export const authTokenSchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string' },
  },
} as const;
