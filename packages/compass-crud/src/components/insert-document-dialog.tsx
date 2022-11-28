import { pull } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import type Document from 'hadron-document';
import { Element } from 'hadron-document';
import {
  Banner,
  css,
  FormModal,
  Icon,
  SegmentedControl,
  SegmentedControlOption,
  spacing,
} from '@mongodb-js/compass-components';

import type { InsertCSFLEWarningBannerProps } from './insert-csfle-warning-banner';
import InsertCSFLEWarningBanner from './insert-csfle-warning-banner';
import InsertJsonDocument from './insert-json-document';
import InsertDocument from './insert-document';

/**
 * The insert invalid message.
 */
const INSERT_INVALID_MESSAGE =
  'Insert not permitted while document contains errors.';

const documentViewId = 'insert-document-view';

const toolbarStyles = css({
  marginTop: spacing[2],
  display: 'flex',
  justifyContent: 'flex-end',
});

const documentViewContainer = css({
  marginTop: spacing[3],
});

const bannerStyles = css({
  marginTop: spacing[3],
});

export type InsertDocumentDialogProps = InsertCSFLEWarningBannerProps & {
  closeInsertDocumentDialog: () => void;
  toggleInsertDocumentView: (view: 'JSON' | 'List') => void;
  toggleInsertDocument: (view: 'JSON' | 'List') => void;
  insertDocument: () => void;
  insertMany: () => void;
  isOpen: boolean;
  message: string;
  mode: 'progress' | 'error';
  version: string;
  updateJsonDoc: (value: string | null) => void;
  jsonDoc: string;
  jsonView: boolean;
  doc: Document;
  ns: string;
  tz: string;
  isCommentNeeded: boolean;
  updateComment: (isCommentNeeded: boolean) => void;
};

type InsertDocumentDialogState = {
  message: string;
  mode: 'progress' | 'error';
};

/**
 * Component for the insert document dialog.
 */
class InsertDocumentDialog extends React.PureComponent<
  InsertDocumentDialogProps,
  InsertDocumentDialogState
> {
  invalidElements: Document['uuid'][];

  /**
   * The component constructor.
   *
   * @param {Object} props - The properties.
   */
  constructor(props: InsertDocumentDialogProps) {
    super(props);
    this.state = { message: this.props.message, mode: this.props.mode };
    this.invalidElements = [];
  }

  /**
   * Handle the property updates and subscriptions to the document.
   *
   * @param {Object} nextProps - The new properties.
   */
  // TODO: COMPASS-5847 Remove deprecated react function usage.
  UNSAFE_componentWillReceiveProps(nextProps: InsertDocumentDialogProps) {
    const isMany = this.hasManyDocuments();

    if (!isMany) {
      // When switching to Hadron Document View - reset the invalid elements list, which contains the
      // uuids of each element that current has BSON type cast errors.
      //
      // Subscribe to the validation errors for BSON types on the document.
      if (nextProps.isOpen && this.props.jsonView && !nextProps.jsonView) {
        this.invalidElements = [];
        nextProps.doc.on(Element.Events.Invalid, this.handleInvalid);
        nextProps.doc.on(Element.Events.Valid, this.handleValid);
        // Closing the modal or switching back to jsonView.
        //
        // Remove the listeners to the BSON type validation errors in order to
        // clean up properly.
      } else if (
        (!nextProps.isOpen && this.props.isOpen && !this.props.jsonView) ||
        (nextProps.isOpen &&
          this.props.isOpen &&
          !this.props.jsonView &&
          nextProps.jsonView)
      ) {
        this.props.doc.removeListener(
          Element.Events.Invalid,
          this.handleInvalid
        );
        this.props.doc.removeListener(Element.Events.Valid, this.handleValid);
      }
    }
    this.setState({ message: nextProps.message, mode: nextProps.mode });
  }

  /**
   * Handles an element in the document becoming valid from invalid.
   *
   * @param {Element} el - Element
   */
  handleValid = (el: Element) => {
    if (this.hasErrors()) {
      pull(this.invalidElements, el.uuid);
      this.forceUpdate();
    }
  };

  /**
   * Handles a valid element in the document becoming invalid.
   *
   * @param {Element} el - Element
   */
  handleInvalid = (el: Element) => {
    if (!this.invalidElements.includes(el.uuid)) {
      this.invalidElements.push(el.uuid);
      this.forceUpdate();
    }
  };

  /**
   * Handle the insert.
   */
  handleInsert() {
    this.setState({ message: 'Inserting Document', mode: 'progress' });
    if (this.hasManyDocuments()) {
      this.props.insertMany();
    } else {
      this.props.insertDocument();
    }
  }

  /**
   * Switches between JSON and Hadron Document views.
   *
   * In case of multiple documents, only switches the this.props.insert.jsonView
   * In other cases, also modifies this.props.insert.doc/jsonDoc to keep data in place.
   *
   * @param {String} view - which view we are looking at: JSON or LIST.
   */
  switchInsertDocumentView(view: string) {
    if (!this.hasManyDocuments()) {
      this.props.toggleInsertDocument(view as 'JSON' | 'List');
    } else {
      this.props.toggleInsertDocumentView(view as 'JSON' | 'List');
    }
  }

  /**
   * Does the document have errors with the bson types?  Checks for
   * invalidElements in hadron doc if in HadronDocument view, or parsing error
   * in JsonView of the modal
   *
   * Checks for invalidElements in hadron doc if in HadronDocument view, or
   * parsing error in JsonView of the modal
   *
   * @returns {Boolean} If the document has errors.
   */
  hasErrors() {
    if (this.props.jsonView) {
      try {
        JSON.parse(this.props.jsonDoc);
        return false;
      } catch {
        return true;
      }
    }
    return this.invalidElements.length > 0;
  }

  /**
   * Check if the json pasted is multiple documents (array).
   *
   * @returns {bool} If many documents are currently being inserted.
   */
  hasManyDocuments() {
    let jsonDoc: unknown;
    try {
      jsonDoc = JSON.parse(this.props.jsonDoc);
    } catch {
      return false;
    }
    return Array.isArray(jsonDoc);
  }

  /**
   * Render the document or json editor.
   *
   * @returns {React.Component} The component.
   */
  renderDocumentOrJsonView() {
    if (!this.props.jsonView) {
      if (this.hasManyDocuments()) {
        return (
          <Banner variant="warning">
            This view is not supported for multiple documents. To specify data
            types and use other functionality of this view, please insert
            documents one at a time.
          </Banner>
        );
      }

      if (!this.props.doc) {
        return;
      }

      return <InsertDocument doc={this.props.doc} />;
    }

    return (
      <InsertJsonDocument
        updateJsonDoc={this.props.updateJsonDoc}
        jsonDoc={this.props.jsonDoc}
        isCommentNeeded={this.props.isCommentNeeded}
        updateComment={this.props.updateComment}
      />
    );
  }

  /**
   * Render the modal dialog.
   *
   * @returns {React.Component} The react component.
   */
  render() {
    const currentView = this.props.jsonView ? 'JSON' : 'List';

    const message = this.hasErrors()
      ? INSERT_INVALID_MESSAGE
      : this.state.message;
    const variant = this.state.mode === 'progress' ? 'info' : 'danger';

    return (
      <FormModal
        title={`Insert to Collection ${this.props.ns}`}
        className="insert-document-dialog"
        open={this.props.isOpen}
        onSubmit={this.handleInsert.bind(this)}
        onCancel={this.props.closeInsertDocumentDialog}
        submitButtonText="Insert"
        submitDisabled={this.hasErrors()}
        trackingId="insert_document_modal"
        data-testid="insert-document-modal"
        minBodyHeight={spacing[6] * 2} // make sure there is enough space for the menu
      >
        <div className={toolbarStyles}>
          <SegmentedControl
            label="View"
            size="small"
            value={currentView}
            aria-controls={documentViewId}
            onChange={this.switchInsertDocumentView.bind(this)}
          >
            <SegmentedControlOption
              disabled={this.hasErrors()}
              data-testid="insert-document-dialog-view-json"
              aria-label="E-JSON View"
              value="JSON"
              onClick={(evt) => {
                // We override the `onClick` functionality to prevent form submission.
                // The value changing occurs in the `onChange` in the `SegmentedControl`.
                evt.preventDefault();
              }}
            >
              <Icon glyph="CurlyBraces" />
            </SegmentedControlOption>
            <SegmentedControlOption
              disabled={this.hasErrors()}
              data-testid="insert-document-dialog-view-list"
              aria-label="Document list"
              value="List"
              onClick={(evt) => {
                // We override the `onClick` functionality to prevent form submission.
                // The value changing occurs in the `onChange` in the `SegmentedControl`.
                evt.preventDefault();
              }}
            >
              <Icon glyph="Menu" />
            </SegmentedControlOption>
          </SegmentedControl>
        </div>
        <div className={documentViewContainer} id={documentViewId}>
          {this.renderDocumentOrJsonView()}
        </div>
        {message && (
          <Banner
            data-testid="insert-document-banner"
            data-variant={variant}
            dismissable={false}
            variant={variant}
            className={bannerStyles}
          >
            {message}
          </Banner>
        )}
        <InsertCSFLEWarningBanner csfleState={this.props.csfleState} />
      </FormModal>
    );
  }

  static displayName = 'InsertDocumentDialog';

  static propTypes = {
    closeInsertDocumentDialog: PropTypes.func.isRequired,
    toggleInsertDocumentView: PropTypes.func.isRequired,
    toggleInsertDocument: PropTypes.func.isRequired,
    insertDocument: PropTypes.func.isRequired,
    insertMany: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    csfleState: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
    updateJsonDoc: PropTypes.func.isRequired,
    jsonDoc: PropTypes.string,
    jsonView: PropTypes.bool,
    doc: PropTypes.object,
    ns: PropTypes.string,
    tz: PropTypes.string,
    isCommentNeeded: PropTypes.bool,
    updateComment: PropTypes.func.isRequired,
  };
}

export default InsertDocumentDialog;