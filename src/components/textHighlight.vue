<template>
    <span class="searchHighlight">
        <span v-if="keyword != ''" class="searchHighlightRow">
            <span v-for="fragment in highlightedText" :key="fragment.id"
                :class="{ searchHighlightLighted: fragment.highlight }" v-text="fragment.text">
            </span>
        </span>
        <p v-else v-text="text" class="searchHighlightRow">
        </p>
    </span>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            default: ''
        },
        keyword: {
            type: String,
            default: ''
        }
    },
    computed: {
        highlightedText() {
            // 正则匹配切分文本中的高亮词
            if (this.text && this.keyword && this.text != '' && this.keyword != ' ') {
                const fragments = [];
                let remainingText = this.text;
                const keywordRegex = new RegExp(this.keyword, "gi");
                while (remainingText.length > 0) {
                    const match = keywordRegex.exec(remainingText);
                    if (match) {
                        const startIndex = match.index;
                        const endIndex = match.index + match[0].length;
                        if (startIndex > 0) {
                            fragments.push({
                                text: remainingText.substring(0, startIndex),
                                highlight: false
                            });
                        }
                        fragments.push({
                            text: remainingText.substring(startIndex, endIndex),
                            highlight: true
                        });
                        remainingText = remainingText.substring(endIndex);
                    } else {
                        fragments.push({
                            text: remainingText,
                            highlight: false
                        });
                        break;
                    }
                }
                return fragments;
            }
        }
    }
}
</script>

<style scoped>
.searchHighlight{
    display: inline;
    width: auto;
}
.searchHighlightRow {
    display: inline;
}

.searchHighlightLighted {
    color: #409eff
}
</style>