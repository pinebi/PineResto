# Restaurant Management System - REST API Documentation

## Base URL
```
http://localhost:3100/api
```

## Authentication
Currently no authentication required for demo purposes. In production, implement JWT or session-based authentication.

## Endpoints

### Categories

#### GET /categories
Get all categories with tree structure.

**Response:**
```json
[
  {
    "id": "1",
    "name": "Ana Yemekler",
    "description": "Sıcak ana yemekler",
    "parentId": null,
    "order": 1,
    "imageUrl": "🍽️",
    "isActive": true,
    "children": [
      {
        "id": "4",
        "name": "Izgara",
        "parentId": "1",
        "children": []
      }
    ]
  }
]
```

#### POST /categories
Create a new category.

**Request Body:**
```json
{
  "name": "Yeni Kategori",
  "description": "Kategori açıklaması",
  "parentId": null,
  "order": 0,
  "imageUrl": "🍕",
  "isActive": true
}
```

#### PUT /categories
Update an existing category.

**Request Body:**
```json
{
  "id": "1",
  "name": "Güncellenmiş Kategori",
  "description": "Yeni açıklama",
  "isActive": true
}
```

#### DELETE /categories?id={categoryId}
Delete a category.

### Products

#### GET /products
Get all products with options.

**Response:**
```json
[
  {
    "id": "1",
    "name": "Köfte",
    "description": "Izgara köfte, pilav ve salata ile",
    "price": 85.00,
    "categoryId": "4",
    "imageUrl": "🍖",
    "isActive": true,
    "order": 1,
    "options": [
      {
        "id": "spice",
        "name": "Acılık Derecesi",
        "values": ["Az Acılı", "Normal", "Çok Acılı"]
      }
    ]
  }
]
```

#### POST /products
Create a new product.

**Request Body:**
```json
{
  "name": "Yeni Ürün",
  "description": "Ürün açıklaması",
  "price": 50.00,
  "categoryId": "1",
  "imageUrl": "🍔",
  "isActive": true,
  "order": 0,
  "options": [
    {
      "id": "size",
      "name": "Boyut",
      "values": ["Küçük", "Büyük"]
    }
  ]
}
```

#### PUT /products
Update an existing product.

#### DELETE /products?id={productId}
Delete a product.

### Orders

#### GET /orders
Get all orders with filtering options.

**Query Parameters:**
- `type`: Filter by order type (kiosk, online)
- `status`: Filter by status (pending, preparing, ready, completed)
- `date`: Filter by date (YYYY-MM-DD)
- `limit`: Limit number of results
- `offset`: Offset for pagination

**Response:**
```json
[
  {
    "id": "1",
    "orderNumber": 1,
    "orderType": "kiosk",
    "status": "preparing",
    "total": 150.00,
    "tableId": "table_5",
    "customerInfo": {
      "name": "Ahmet Yılmaz",
      "phone": "05551234567",
      "tableNumber": "5"
    },
    "paymentMethod": "cash",
    "estimatedTime": 20,
    "createdAt": "2024-01-15T10:30:00Z",
    "items": [
      {
        "id": "1",
        "product": {
          "id": "1",
          "name": "Köfte",
          "price": 85.00
        },
        "quantity": 1,
        "selectedOptions": {
          "spice": "Normal"
        },
        "notes": "Az acılı olsun"
      }
    ]
  }
]
```

#### POST /orders
Create a new order.

**Request Body:**
```json
{
  "orderType": "online",
  "tableId": "table_5",
  "customerInfo": {
    "name": "Ayşe Demir",
    "phone": "05559876543",
    "address": "İstanbul, Kadıköy"
  },
  "paymentMethod": "card",
  "items": [
    {
      "product": {
        "id": "1",
        "name": "Köfte",
        "price": 85.00
      },
      "quantity": 2,
      "selectedOptions": {
        "spice": "Çok Acılı"
      },
      "notes": "Soğansız"
    }
  ],
  "notes": "Acele edin"
}
```

#### PUT /orders/{orderId}
Update order status.

**Request Body:**
```json
{
  "status": "preparing",
  "estimatedTime": 25
}
```

#### DELETE /orders/{orderId}
Cancel an order.

### Tables

#### GET /tables
Get all tables with current status.

**Response:**
```json
[
  {
    "id": "table_1",
    "number": "1",
    "capacity": 4,
    "status": "occupied",
    "currentOrderId": "order_123"
  }
]
```

#### PUT /tables/{tableId}
Update table status.

**Request Body:**
```json
{
  "status": "available",
  "currentOrderId": null
}
```

### Dashboard Statistics

#### GET /dashboard/stats
Get dashboard statistics.

**Response:**
```json
{
  "totalOrders": 150,
  "totalRevenue": 12500.00,
  "kioskOrders": 80,
  "onlineOrders": 70,
  "activeTables": 5,
  "pendingOrders": 3,
  "preparingOrders": 8,
  "readyOrders": 2,
  "todayOrders": 12,
  "todayRevenue": 850.00
}
```

### Real-time Updates

#### WebSocket Connection
For real-time order updates, connect to:
```
ws://localhost:3100/ws/orders
```

**Events:**
- `order_created`: New order created
- `order_updated`: Order status updated
- `order_completed`: Order completed

**Example:**
```javascript
const ws = new WebSocket('ws://localhost:3100/ws/orders');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'order_created') {
    console.log('New order:', data.order);
  }
};
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per IP

## Data Validation

### Product Options
- Option values must be unique within the same option
- Maximum 10 options per product
- Maximum 20 values per option

### Orders
- Minimum order amount: ₺10.00
- Maximum items per order: 50
- Order timeout: 30 minutes for automatic cancellation

### Tables
- Table numbers must be unique
- Maximum capacity: 12 people
- Table status automatically updates based on orders

## Security Considerations

1. **Input Validation**: All inputs are validated and sanitized
2. **SQL Injection**: Using parameterized queries
3. **XSS Protection**: Output encoding
4. **CORS**: Configured for specific origins
5. **Rate Limiting**: Prevents abuse
6. **Data Encryption**: Sensitive data encrypted at rest

## Database Backup

Regular backups should be scheduled:
- Daily full backups
- Hourly incremental backups
- Point-in-time recovery available

## Monitoring

Key metrics to monitor:
- API response times
- Error rates
- Order processing times
- Database performance
- WebSocket connections

## Deployment

### Environment Variables
```
DATABASE_URL=mysql://user:password@localhost:3306/restaurant_db
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
NODE_ENV=production
```

### Docker Deployment
```bash
docker-compose up -d
```

### Health Check
```
GET /health
```

Returns system status and database connectivity.











