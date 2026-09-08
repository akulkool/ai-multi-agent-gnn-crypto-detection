import redis


redis_client = redis.Redis(
    host="localhost",
    port=6380,
    decode_responses=True
)


def test_redis():
    try:
        redis_client.ping()
        print("Redis connection successful!")
        return True

    except redis.RedisError as e:
        print(f"Redis connection failed: {e}")
        return False
