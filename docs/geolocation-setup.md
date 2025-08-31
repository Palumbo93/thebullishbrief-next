# Geolocation Setup for Brokerage Widget

## Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
# IPinfo Lite API Token for geolocation
IPINFO_TOKEN=cb6e27f2e4a175
```

## How It Works

1. **IP Detection**: The API route detects the user's IP address from request headers
2. **Geolocation**: Uses IPinfo Lite API to determine the user's country
3. **Caching**: Results are cached for 24 hours to minimize API calls
4. **Brokerage Filtering**: Shows US brokerages for US users, Canadian brokerages for Canadian users
5. **Fallback**: Defaults to Canadian brokerages if geolocation fails

## API Endpoints

### GET `/api/geolocation/brokerages`
Returns the user's country code based on their IP address.

**Response:**
```json
{
  "country": "US",
  "source": "ipinfo"
}
```

### POST `/api/geolocation/brokerages`
Allows manual country override for testing.

**Request:**
```json
{
  "country": "CA",
  "ip": "127.0.0.1"
}
```

## Testing

Test with different IP addresses using the `X-Forwarded-For` header:

```bash
# Test with US IP
curl -X GET "http://localhost:3000/api/geolocation/brokerages" \
  -H "X-Forwarded-For: 8.8.8.8"

# Test with Canadian IP  
curl -X GET "http://localhost:3000/api/geolocation/brokerages" \
  -H "X-Forwarded-For: 24.48.0.1"
```

## Brokerage Configuration

The system now supports country-specific brokerages:

- **US**: Charles Schwab, Fidelity, E*TRADE, TD Ameritrade, Robinhood, Interactive Brokers
- **Canada**: Questrade, Wealthsimple, TD Direct, RBC Direct, CIBC Investor's Edge, Interactive Brokers

## Performance

- **Caching**: 24-hour cache reduces API calls
- **Timeout**: 3-second timeout prevents hanging requests
- **Fallback**: Graceful degradation if geolocation fails
- **Loading States**: User-friendly loading indicators
