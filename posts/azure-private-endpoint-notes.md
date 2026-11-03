---
Title: "Azure Private Endpoints: The Routing Details I Check First"
Date: 2026-10-21
Category: Cloud
Excerpt: "A practical checklist for keeping private service traffic private while making the failure mode observable."
---

## The short version

Private endpoints solve a network path problem, not an observability problem. Before changing a route table, I write down the intended path from the workload to the service and the DNS answer that should make that path possible.

## My pre-flight checks

1. Confirm the private DNS zone is linked to the correct virtual network.
2. Resolve the service hostname from the workload subnet.
3. Verify the network security group allows the intended flow.
4. Test the path from the same identity and subnet as the application.

```bash
nslookup my-service.privatelink.azure.com
curl -I https://my-service.azurewebsites.net
```

If the DNS answer is public, the private endpoint is not the first thing to debug. Start at name resolution, then move outward toward routing and policy.
