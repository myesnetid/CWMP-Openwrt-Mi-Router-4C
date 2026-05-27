'use strict';
'require view';
'require form';
'require uci';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('easycwmp'),
			callServiceList('easycwmpd')
		]);
	},

	render: function(data) {
		var serviceStatus = data[1];
		var isRunning = (serviceStatus && serviceStatus.easycwmpd &&
			serviceStatus.easycwmpd.instances &&
			Object.keys(serviceStatus.easycwmpd.instances).length > 0);

		var statusBadge = E('div', { class: 'cbi-section' }, [
			E('div', { class: 'cbi-section-node' }, [
				E('div', { class: 'cbi-value' }, [
					E('label', { class: 'cbi-value-title' }, _('Service Status')),
					E('div', { class: 'cbi-value-field' }, [
						E('span', {
							style: 'display:inline-block;padding:3px 10px;border-radius:3px;color:#fff;font-weight:bold;background:' +
								(isRunning ? '#46b450' : '#dc3232')
						}, isRunning ? _('Running') : _('Stopped')),
						E('button', {
							class: 'btn cbi-button cbi-button-action',
							style: 'margin-left:10px',
							click: function() {
								return rpc.call('service', isRunning ? 'stop' : 'start', { name: 'easycwmpd' })
									.then(function() { location.reload(); });
							}
						}, isRunning ? _('Stop') : _('Start')),
						E('button', {
							class: 'btn cbi-button cbi-button-action',
							style: 'margin-left:5px',
							click: function() {
								return rpc.call('service', 'restart', { name: 'easycwmpd' })
									.then(function() { location.reload(); });
							}
						}, _('Restart'))
					])
				])
			])
		]);

		var m, s, o;
		m = new form.Map('easycwmp', _('EasyCWMP'),
			_('Configure the TR-069 CWMP client (easycwmp). Changes require service restart to take effect.'));

		/* ===== LOCAL ===== */
		s = m.section(form.TypedSection, 'local', _('Local Settings'),
			_('Connection Request listener settings for incoming ACS connections.'));
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Flag, 'enable', _('Enable EasyCWMP'));
		o.rmempty = false;

		o = s.option(form.Value, 'interface', _('Listen Interface'));
		o.placeholder = 'eth0';

		o = s.option(form.Value, 'port', _('Listen Port'));
		o.placeholder = '7547';
		o.datatype = 'port';

		o = s.option(form.Value, 'username', _('CR Username'),
			_('Username for Connection Request authentication.'));
		o.placeholder = 'easycwmp';

		o = s.option(form.Value, 'password', _('CR Password'));
		o.password = true;
		o.placeholder = 'easycwmp';

		o = s.option(form.ListValue, 'authentication', _('CR Authentication'));
		o.value('Digest', _('Digest (recommended)'));
		o.value('Basic', _('Basic'));

		o = s.option(form.ListValue, 'logging_level', _('Logging Level'));
		o.value('0', _('0 - Disable'));
		o.value('1', _('1 - Error'));
		o.value('2', _('2 - Warning'));
		o.value('3', _('3 - Notice'));
		o.value('4', _('4 - Info'));

		/* ===== ACS ===== */
		s = m.section(form.TypedSection, 'acs', _('ACS Settings'),
			_('Auto Configuration Server connection parameters.'));
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Value, 'url', _('ACS URL'));
		o.placeholder = 'http://acs.example.com:7547';
		o.rmempty = false;

		o = s.option(form.Value, 'username', _('ACS Username'));
		o.placeholder = 'acs';

		o = s.option(form.Value, 'password', _('ACS Password'));
		o.password = true;
		o.placeholder = 'acs123';

		o = s.option(form.Flag, 'ssl_verify', _('Verify SSL Certificate'));
		o.default = '0';
		o.rmempty = false;

		/* ===== PERIODIC INFORM ===== */
		s = m.section(form.TypedSection, 'acs', _('Periodic Inform'));
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Flag, 'periodic_enable', _('Enable Periodic Inform'));
		o.rmempty = false;

		o = s.option(form.Value, 'periodic_interval', _('Interval (seconds)'));
		o.placeholder = '300';
		o.datatype = 'uinteger';
		o.depends('periodic_enable', '1');

		o = s.option(form.Value, 'periodic_time', _('Periodic Time'),
			_('Reference time for interval alignment. Format: YYYY-MM-DDTHH:MM:SS (optional)'));
		o.placeholder = '2000-01-01T00:00:00';
		o.depends('periodic_enable', '1');
		o.optional = true;

		/* ===== CONNECTION REQUEST ===== */
		s = m.section(form.TypedSection, 'local', _('Connection Request'),
			_('Settings that are reported to the ACS for incoming connection requests.'));
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Value, 'connection_request_path', _('CR Path'),
			_('URL path suffix advertised to ACS. e.g. /cwmp'));
		o.placeholder = '/cwmp';
		o.optional = true;

		o = s.option(form.Flag, 'use_nat_detect', _('Auto-detect NAT Address'),
			_('Automatically determine external IP for Connection Request URL.'));
		o.default = '0';
		o.rmempty = false;

		/* ===== DEVICE INFO ===== */
		s = m.section(form.TypedSection, 'device', _('Device Info'),
			_('Device identification parameters reported to ACS.'));
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Value, 'manufacturer', _('Manufacturer'));
		o = s.option(form.Value, 'oui', _('OUI'),
			_('Organizationally Unique Identifier (6 hex digits).'));
		o = s.option(form.Value, 'product_class', _('Product Class'));
		o = s.option(form.Value, 'serial_number', _('Serial Number'));
		o = s.option(form.Value, 'hardware_version', _('Hardware Version'));
		o = s.option(form.Value, 'software_version', _('Software Version'));

		/* ===== ADVANCED ===== */
		s = m.section(form.TypedSection, 'local', _('Advanced Settings'));
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Flag, 'log_to_file', _('Log to File'));
		o.default = '0';
		o.rmempty = false;

		o = s.option(form.Value, 'log_file_name', _('Log File Path'));
		o.placeholder = '/var/log/easycwmp.log';
		o.depends('log_to_file', '1');

		o = s.option(form.Value, 'log_file_size', _('Max Log File Size (KB)'));
		o.placeholder = '512';
		o.datatype = 'uinteger';
		o.depends('log_to_file', '1');

		o = s.option(form.Flag, 'netlink_enable', _('Enable Netlink'),
			_('Use netlink to detect interface changes and trigger Inform.'));
		o.default = '1';
		o.rmempty = false;

		o = s.option(form.Value, 'retry_min_wait_interval', _('Retry Min Wait Interval'));
		o.placeholder = '5';
		o.datatype = 'uinteger';

		o = s.option(form.Value, 'retry_interval_multiplier', _('Retry Interval Multiplier'));
		o.placeholder = '2000';
		o.datatype = 'uinteger';

		return m.render().then(function(node) {
			node.prepend(statusBadge);
			return node;
		});
	},

	handleSaveApply: function(ev) {
		return this.handleSave(ev).then(function() {
			return rpc.call('service', 'restart', { name: 'easycwmpd' });
		}).then(function() {
			ui.addNotification(null, E('p', _('EasyCWMP restarted successfully.')), 'info');
		});
	}
});
