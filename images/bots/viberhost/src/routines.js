module.exports = {
  isset: function (variable)
  {
    try
    {
      return typeof eval(variable) !== 'undefined'
    } catch (err)
    {
      return false
    }
  },

  has: function (obj, key)
  {
    return key.split('.').every(function (x)
    {
      if (typeof obj != 'object' || obj === null || !x in obj)
        return false
      obj = obj[x]
      return true
    })
  },

  isNumeric: function (n)
  {
    return !isNaN(parseFloat(n)) && isFinite(n)
  },

  telegramMessageSchema: function()
  {
    'use strict'

    var schema = {
      'properties': {
        'chat': {
          'id': '/properties/chat',
          'properties': {
            'first_name': {
              'id': '/properties/chat/properties/first_name',
              'type': 'string',
            },
            'id': {
              'id': '/properties/chat/properties/id',
              'type': 'integer',
            },
            'last_name': {
              'id': '/properties/chat/properties/last_name',
              'type': 'string',
            },
            'type': {
              'id': '/properties/chat/properties/type',
              'type': 'string',
            },
          },
          'type': 'object',
        },
        'date': {
          'id': '/properties/date',
          'type': 'integer',
        },
        'from': {
          'id': '/properties/from',
          'properties': {
            'first_name': {
              'id': '/properties/from/properties/first_name',
              'type': 'string',
            },
            'id': {
              'id': '/properties/from/properties/id',
              'type': 'integer',
            },
            'username': {
              'id': '/properties/from/properties/username',
              'type': 'string',
            },
          },
          'type': 'object',
        },
        'message_id': {
          'id': '/properties/message_id',
          'type': 'integer',
        },
        'text': {
          'id': '/properties/text',
          'type': 'string',
        },
      },
      'type': 'object',
    }
    return schema;

  }
}
