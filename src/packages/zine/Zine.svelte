<script>
  const pull = require("pull-stream");
  const paramap = require("pull-paramap");
  const sort = require("pull-sort");
  const { onDestroy, tick } = require("svelte");
  const { timestamp } = require("../../core/components/timestamp.js");

  export let filter = "everyone";
  export let channel = false;
  let sbot = ssb.sbot;
  let content = [];
  let channels = [];
  let limit = 20;


  let opts = {};

  const subscribedChannels = () => {
    pull(
      sbot.query.read({
        reverse: true,
        query: [
          {
            $filter: {
              value: {
                author: sbot.id,
                content: { type: "channel" }
              }
            }
          },
          { $map: ["value", "content"] }
        ]
      }),
      pull.unique("channel"),
      pull.filter("subscribed"),
      pull.map("channel"),
      pull.collect((e, c) => {
        channels = c;
        channel = channel || channels[0];
        getContentForChannel(channel);
      })
    );
  };

  const getContentForChannel = c => {
    content = [];
    channel = c;
    let query = [
      {
        $filter: {
          value: {
            content: {
              channel: c,
              type: { $in: ["post", "blog"] }
            }
          }
        }
      }
    ];

    pull(
      sbot.query.read({
        query,
        reverse: true
      }),
      ssb.filterWithUserFilters(),
      pull.filter(msg => {
        if (msg.value.content.type === "post") {
          let root = msg.value.content.root;
          let branch = msg.value.content.branch;

          if (branch) return false;
          if (root && root !== msg.key) return false;
        }
        return true;
      }),
      pull.take(limit),
      pull.drain(function(data) {
        content.push(data);
        content = content;
      })
    );
  };

  subscribedChannels();
</script>

<style>  
  .masonry {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    grid-template-rows: masonry;
  }
</style>

<div class="container">
  <!-- <span>Show content from</span>
  <div class="btn-group">
    <button
      class="btn"
      class:btn-primary={filter == 'everyone'}
      on:click={() => (filter = 'everyone')}>
      Everyone
    </button>
    <button
      class="btn"
      class:btn-primary={filter == 'friends'}
      on:click={() => (filter = 'friends')}>
      Friends
    </button>
    <button
      class="btn"
      class:btn-primary={filter == 'followers'}
      on:click={() => (filter = 'followers')}>
      People you follow
    </button>
  </div> -->

  <div class="dropdown">
    <a href="#" class="btn btn-link dropdown-toggle" tabindex="0">
      {channel}
      <i class="icon icon-caret" />
    </a>
    <!-- menu component -->
    <ul class="menu">
      {#each channels as c}
        <li class="menu-item">
          <a on:click|preventDefault={() => getContentForChannel(c)} href="#">
            {c}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>

<div class="zine">
  {#if content.length == 0}
    <div class="loading" />
  {:else}
    <div class="masonry">
      {#each content as msg}
        <div class="item">
          {#if msg.value.content.type === 'post'}
            <div class="card">
              <div class="card-body">
                {@html ssb.markdown(msg.value.content.text).slice(0, 500).replace(/h1/gi, "h3")}
              </div>
              <div class="card-footer">
                <span class="float-left">{timestamp(msg.value.timestamp)}</span>
                <a
                  href={patchfox.url('hub', 'thread', { thread: msg.key })}
                  class="btn btn-link float-right">
                  &rarr;
                </a>
              </div>
            </div>
          {/if}
          {#if msg.value.content.type === 'blog'}
            <div class="card">
              <div class="card-header">
                {#if msg.value.content.title}
                  <div class="card-title h5">{msg.value.content.title}</div>
                {/if}
              </div>
              <div class="card-body">
                {ssb.markdown(msg.value.content.summary)}
              </div>
              <div class="card-footer">
                <span class="float-left">{timestamp(msg.value.timestamp)}</span>
                <a
                  href={patchfox.url('hub', 'thread', { thread: msg.key })}
                  class="btn btn-link float-right">
                  &rarr;
                </a>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
