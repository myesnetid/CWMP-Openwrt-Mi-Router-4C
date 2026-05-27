include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-easycwmp
PKG_VERSION:=1.0.0
PKG_RELEASE:=1
PKG_MAINTAINER:=myesnetid
PKG_LICENSE:=GPL-2.0

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-easycwmp
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=LuCI Support for EasyCWMP (TR-069)
  DEPENDS:=+luci-base +easycwmp
  PKGARCH:=all
endef

define Package/luci-app-easycwmp/description
  LuCI web interface for EasyCWMP TR-069 CWMP client.
  Provides configuration of ACS settings, Connection Request,
  Periodic Inform, and advanced options.
endef

define Package/luci-app-easycwmp/conffiles
/etc/config/easycwmp
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
endef

define Build/Compile
endef

define Package/luci-app-easycwmp/install
	# ACL
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) $(CURDIR)/root/usr/share/rpcd/acl.d/luci-app-easycwmp.json \
		$(1)/usr/share/rpcd/acl.d/luci-app-easycwmp.json

	# Menu
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) $(CURDIR)/root/usr/share/luci/menu.d/luci-app-easycwmp.json \
		$(1)/usr/share/luci/menu.d/luci-app-easycwmp.json

	# JS View
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/easycwmp
	$(INSTALL_DATA) $(CURDIR)/htdocs/luci-static/resources/view/easycwmp/config.js \
		$(1)/www/luci-static/resources/view/easycwmp/config.js

	# Default UCI config
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) $(CURDIR)/root/etc/config/easycwmp \
		$(1)/etc/config/easycwmp
endef

$(eval $(call BuildPackage,luci-app-easycwmp))
