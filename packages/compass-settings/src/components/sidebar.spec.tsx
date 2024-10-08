import React from 'react';
import {
  cleanup,
  render,
  screen,
  within,
  userEvent,
} from '@mongodb-js/testing-library-compass';
import { spy } from 'sinon';
import { expect } from 'chai';

import Sidebar from './sidebar';

describe('Sidebar', function () {
  afterEach(function () {
    cleanup();
  });

  it('renders sidebar with menu items', function () {
    render(
      <Sidebar
        activeItem="theme"
        items={[
          ['theme', 'Theme'],
          ['general', 'General'],
        ]}
        onSelectItem={() => {}}
      />
    );
    const sidebar = screen.getByTestId('settings-modal-sidebar');
    expect(sidebar).to.exist;
    expect(within(sidebar).getByTestId('sidebar-theme-item')).to.exist;
    expect(within(sidebar).getByTestId('sidebar-general-item')).to.exist;
  });

  it('selects items', function () {
    const onSelectItemSpy = spy();
    render(
      <Sidebar
        activeItem="theme"
        items={[
          ['theme', 'Theme'],
          ['general', 'General'],
        ]}
        onSelectItem={onSelectItemSpy}
      />
    );
    expect(onSelectItemSpy.calledOnce).to.be.false;
    const sidebar = screen.getByTestId('settings-modal-sidebar');

    const profileItem = within(sidebar).getByTestId('sidebar-general-item');
    userEvent.click(profileItem);
    expect(onSelectItemSpy.calledOnce).to.be.true;
  });
});
