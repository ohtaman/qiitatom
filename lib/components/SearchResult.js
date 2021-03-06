'use babel';

import { React, ReactDOM } from 'react-for-atom';
import ReactMarkdown from 'react-markdown';

export default class extends React.Component {
  constructor() {
    super();
    this.searchResultContainerHeight = 0;
    this.state = {
      currentContentId: null,
      coverHeight: 0
    };
  }

  componentWillReceiveProps() {
    this.searchResultContainerHeight = 0; // change page
    this.setState({
      coverHeight: 0
    });
  }

  componentDidMount() {
    this.setState({
      coverHeight: this.props.getContentHeight()
    }, () => {
      this.searchResultContainerHeight = this.state.coverHeight;
    });
  }

  componentDidUpdate() {
    const coverHeight = this.props.getContentHeight();
    if (this.state.coverHeight !== coverHeight) this.setState({coverHeight});
    if (this.state.currentContentId === null) {
      if (this.searchResultContainerHeight === 0) {
        this.searchResultContainerHeight = coverHeight;
      } else {
        this.props.rerender();
      }
    } else {
      const container = document.getElementsByClassName('qiitatom-search-result')[0];
      const paneHeight = container.clientHeight;
      const buttonHeight = document.getElementsByClassName('qiitatom-search-result__content--button-back')[0].clientHeight;
      const paddingHeight = 6 * 2;
      const buttonMarginBottom = 10;
      const newHeight = paneHeight - buttonHeight - paddingHeight - buttonMarginBottom;
      const markdown = ReactDOM.findDOMNode(this.refs.markdownContainer);
      markdown.style.height = `${newHeight}px`;
      markdown.style.overflow = 'scroll';
      container.scrollTop = 0;
    }
  }

  showContent() {
    const {
      currentContentId
    } = this.state;
    const {
      result
    } = this.props;
    const target = result[currentContentId];

    return target ? (
      <div className="qiitatom-search-result__content">
        <div className="qiitatom-search-result__content--button-back">
          <span onClick={() => this.setState({currentContentId: null})}>検索結果一覧に戻る</span>
          <span>{target.title}</span>
        </div>
        <ReactMarkdown
          ref="markdownContainer"
          className="qiitatom-markdown"
          source={target.body}
        />
      </div>
    ) : null;
  }

  getContentList() {
    const {
      result
    } = this.props;
    return result.map((item, index) => {
      return (
        <div
          className="qiitatom-search-result__items-item"
          onClick={() => this.setState({currentContentId: index})}
        >
          <span>{item.title}</span> {item.user.name ? `by ${item.user.name}` : ''}
        </div>
      );
    });
  }

  getPager() {
    const {
      getContent,
      currentPage,
      totalPage
    } = this.props;
    const previousEnabled = currentPage !== 1;
    const nextEnabled = currentPage !== totalPage;
    return (
      <div className="qiitatom-search-result__pager">
      {
        previousEnabled ? (
          <span onClick={() => getContent(currentPage - 1)}>前のページへ</span>
        ) : null
      }
      {
        nextEnabled ? (
          <span onClick={() => getContent(currentPage + 1)}>次のページへ</span>
        ) : null
      }
      </div>
    );
  }

  render() {
    const {
      result,
      query,
      currentPage,
      totalPage,
      isFetching
    } = this.props;
    const {
      coverHeight
    } = this.state;

    const {
      currentContentId
    } = this.state;
    return currentContentId !== null ? this.showContent() : (
      <div ref="container">
        <div
          className="qiitatom-search-result__loadingCover"
          style={{
            height    : coverHeight,
            visibility: isFetching ? '' : 'hidden'
          }}
        />
        <div className="qiitatom-search-result__header">
          <span>{query}</span> の結果検索結果({currentPage} / {totalPage}ページ)
        </div>
        <div className="qiitatom-search-result__items">
          {this.getContentList()}
        </div>
        {this.getPager()}
      </div>
    );
  }
}
