import unittest

from supabase_client import SupabaseWriter


class Response:
    def __init__(self, data):
        self.data = data


class RpcCall:
    def __init__(self, client, params):
        self.client = client
        self.params = params

    def execute(self):
        item = self.params["p_detected_label"]
        self.client.queue.append(item)
        limit = self.params["p_limit"]
        evicted = []
        while len(self.client.queue) > limit:
            evicted.append(self.client.queue.pop(0))
        return Response(
            [
                {
                    "observation_id": f"obs-{item}",
                    "evicted_image_paths": evicted,
                }
            ]
        )


class InsertCall:
    def __init__(self, client, payload):
        self.client = client
        self.payload = payload

    def execute(self):
        self.client.inserted.append(self.payload)
        return Response([{"id": "unknown-observation"}])


class Table:
    def __init__(self, client):
        self.client = client

    def insert(self, payload):
        return InsertCall(self.client, payload)


class FakeClient:
    def __init__(self):
        self.queue = []
        self.inserted = []
        self.rpc_calls = 0

    def rpc(self, name, params):
        if name != "enqueue_bird_observation":
            raise AssertionError(f"Unexpected RPC {name}")
        self.rpc_calls += 1
        return RpcCall(self, params)

    def table(self, _name):
        return Table(self)


class FifoWriterTests(unittest.TestCase):
    def setUp(self):
        self.client = FakeClient()
        self.writer = SupabaseWriter(
            url="https://example.supabase.co",
            service_role_key="test",
            recent_image_limit=6,
        )
        self.writer._client = self.client

    def enqueue(self, number):
        return self.writer.enqueue_recognized_observation(
            detected_label=f"Bird {number}",
            confidence=0.9,
            image_url=f"https://images/{number}.jpg",
            image_path=f"obs/{number}.jpg",
            species_id=None,
            bbox=None,
        )

    def test_seventh_and_eighth_insertions_evict_oldest(self):
        for number in range(1, 7):
            self.enqueue(number)
        self.assertEqual(
            self.client.queue,
            ["Bird 1", "Bird 2", "Bird 3", "Bird 4", "Bird 5", "Bird 6"],
        )

        self.enqueue(7)
        self.assertEqual(
            self.client.queue,
            ["Bird 2", "Bird 3", "Bird 4", "Bird 5", "Bird 6", "Bird 7"],
        )
        self.enqueue(8)
        self.assertEqual(
            self.client.queue,
            ["Bird 3", "Bird 4", "Bird 5", "Bird 6", "Bird 7", "Bird 8"],
        )

    def test_unknown_observation_never_calls_fifo_rpc(self):
        self.writer.record_unrecognized(confidence=0.6)

        self.assertEqual(self.client.rpc_calls, 0)
        self.assertEqual(len(self.client.inserted), 1)
        self.assertIsNone(self.client.inserted[0]["image_url"])
        self.assertFalse(self.client.inserted[0]["is_recognized"])
        self.assertEqual(
            self.client.inserted[0]["detected_label"],
            "Unknown bird",
        )


if __name__ == "__main__":
    unittest.main()
