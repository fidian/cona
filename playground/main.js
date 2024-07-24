import { Cona } from "../dist/index.mjs";

// Expose Cona for debugging.
window.Cona = Cona;

class SelectedAlbum extends Cona {
  render(h) {
    return h`
      <div class="selected">
        <div>
          <div class="selected-title">
            <h1>Album ${this.props.album[0].albumId} images</h1>
            <button onclick=${this.props.hide} class="selected-close">Close</button>
          </div>
          <div class="images">
            ${this.props.album.map(
              (img) => h`
              <div class="image-item">
                <img src=${img.thumbnailUrl} />
                <div>${img.title}</div>
              </div>
            `,
            )}
          </div>
        </div>
      </div>
    `;
  }
}

class AlbumItem extends Cona {
  render(h) {
    return h`
      <div class="album-item">
        <button onclick=${this.props.view}>View album images</button>
        <div>${this.props.title}</div>
      </div>
    `;
  }
}

class AlbumList extends Cona {
  setup() {
    this.state = this.reactive({
      albums: [],
      isFetched: false,
      selectedAlbum: undefined,
      search: "",
    });

    this.h1Ref = this.ref();
    this.effect(
      () => this.state.search,
      (oldValue, newValue) => console.log(`Search changed from "${oldValue}" to "${newValue}"`),
    );

    this.watch(
      () => this.state.search,
      (newValue, oldValue) => {
        console.log(`Count changed from ${oldValue} to ${newValue}`);
      },
    );
  }

  matchedAlbums() {
    if (!this.state.search) return this.state.albums;
    return this.state.albums.filter((v) =>
      v.title.toLowerCase().includes(this.state.search.toLowerCase()),
    );
  }

  async onMounted() {
    const response = await fetch("albums.json");
    this.state.albums = (await response.json()) || [];
    this.state.isFetched = true;
  }

  onUpdated() {
    console.log("onUpdated, h1Ref is", this.h1Ref?.current);
  }

  async viewAlbum(id) {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/albums/${id}/photos`,
    );
    this.state.selectedAlbum = (await response.json()) || [];
    document.body.style.overflow = "hidden";
  }

  hideAlbum() {
    this.state.selectedAlbum = undefined;
    document.body.style.overflow = "initial";
  }

  searchValue(e) {
    console.log('searchValue', e.target.value);
    this.state.search = e.target.value;
  }

  render(h) {
    if (!this.state.isFetched)
      return h`<div class="loading">fetching albums...</div>`;
    if (this.state.albums.length === 0) return h`<div>no albums found</div>`;

    return h`
      <div>
        <h1 ref=${this.h1Ref}>Albums</h1>
        <input
          placeholder="Search albums"
          value=${this.state.search}
          oninput=${this.searchValue}
        />
        <div class="albums">
          ${this.matchedAlbums().map(
            (album) =>
              h`<album-item p:title=${album.title} p:view=${() =>
                this.viewAlbum(album.id)}></album-item>`,
          )}
        </div>
        ${
          this.state.selectedAlbum
            ? h`<selected-album p:album=${this.state.selectedAlbum} p:hide=${this.hideAlbum}></selected-album>`
            : ""
        }
      </div>
    `;
  }
}

customElements.define("album-list", AlbumList);
customElements.define("album-item", AlbumItem);
customElements.define("selected-album", SelectedAlbum);
