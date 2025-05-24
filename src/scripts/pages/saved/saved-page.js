import {
    generateLoaderAbsoluteTemplate,
    generateStoriesListEmptyTemplate,
    generateStoriesListErrorTemplate, generateStoryItemTemplate
} from "../../template";
import SavedPresenter from "./saved-funtions";
import Database from "../../data/database";

export default class SavedPage {
    #presenter;

    async render() {
        return `
            <section class="container">
                <h1 class="section-title">List Story yang Tersimpan</h1>
         
                <div class="stories-list__container">
                  <div id="stories-list"></div>
                  <div id="stories-list-loading-container"></div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.#presenter = new SavedPresenter({
            view: this,
            model: Database
        });

        await this.#presenter.initialSavedStories();
    }

    populateSavedStories(message, listStory) {
        if (listStory.length <= 0) {
            this.populateSavededStoriesListEmpty();
            return;
        }

        const html = listStory.reduce((acc, story) => {
            const coordinate = {
                latitude: story.lat,
                longitude: story.lon,
            }

            console.log(coordinate);

            return acc.concat(
                generateStoryItemTemplate({
                    id: story.id,
                    name: story.name,
                    description: story.description,
                    photoUrl: story.photoUrl,
                    createdAt: story.createdAt,
                    location: { latitude: story.lat, longitude: story.lon },
                })
            );
        }, '');

        document.getElementById('stories-list').innerHTML = `
          <div class="stories-list">${html}</div>
        `;
    }

    populateSavededStoriesListEmpty() {
        document.getElementById('stories-list').innerHTML = generateStoriesListEmptyTemplate();
    }

    populateSavededStoriesError(message) {
        document.getElementById('stories-list').innerHTML = generateStoriesListErrorTemplate(message);
    }

    showStoriesListLoading() {
        document.getElementById('stories-list-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
    }

    hideStoreListLoading() {
        document.getElementById('stories-list-loading-container').innerHTML = '';
    }
}