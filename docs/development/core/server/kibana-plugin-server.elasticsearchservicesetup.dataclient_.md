<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-server](./kibana-plugin-server.md) &gt; [ElasticsearchServiceSetup](./kibana-plugin-server.elasticsearchservicesetup.md) &gt; [dataClient$](./kibana-plugin-server.elasticsearchservicesetup.dataclient_.md)

## ElasticsearchServiceSetup.dataClient$ property

Observable of clients for the `data` cluster. Observable emits when Elasticsearch config changes on the Kibana server. See [IClusterClient](./kibana-plugin-server.iclusterclient.md)<!-- -->.


```js
const client = await elasticsearch.dataClient$.pipe(take(1)).toPromise();

```

<b>Signature:</b>

```typescript
readonly dataClient$: Observable<IClusterClient>;
```
