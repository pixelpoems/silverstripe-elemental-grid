<?php

namespace WeDevelop\ElementalGrid\Extensions;

use DNADesign\Elemental\Models\BaseElement;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\HTTPResponse;
use SilverStripe\Core\Extension;
use SilverStripe\Security\SecurityToken;
use WeDevelop\ElementalGrid\ElementalConfig;

/**
 * Adds an endpoint to ElementalAreaController for saving the column size / offset
 * that is selected in the element list of the element editor.
 *
 * Grid blocks are not inline editable, so there is no element form that could
 * submit these values together with the page form.
 */
class ElementalAreaControllerExtension extends Extension
{
    private const VIEWPORTS = ['XS', 'SM', 'MD', 'LG', 'XL'];

    private static array $url_handlers = [
        'POST gridColumn/$ItemID' => 'gridColumn',
    ];

    private static array $allowed_actions = [
        'gridColumn',
    ];

    public function gridColumn(HTTPRequest $request): HTTPResponse
    {
        if (!SecurityToken::inst()->checkRequest($request)) {
            return $this->jsonResponse(400, 'Invalid security token');
        }

        $element = BaseElement::get()->byID((int) $request->param('ItemID'));
        if (!$element) {
            return $this->jsonResponse(404, 'Element not found');
        }

        if (!$element->canEdit()) {
            return $this->jsonResponse(403, 'Insufficient permissions');
        }

        $type = (string) $request->postVar('Type');
        $viewport = strtoupper((string) $request->postVar('Viewport'));
        $value = $request->postVar('Value');

        if (!in_array($type, ['Size', 'Offset'], true) || !in_array($viewport, self::VIEWPORTS, true)) {
            return $this->jsonResponse(400, 'Invalid field');
        }

        if (!is_numeric($value)) {
            return $this->jsonResponse(400, 'Invalid value');
        }

        $value = (int) $value;
        if ($value < 0 || $value > ElementalConfig::getGridColumnCount()) {
            return $this->jsonResponse(400, 'Invalid value');
        }

        $field = $type . $viewport;
        $element->$field = $value;
        $element->write();

        return $this->jsonResponse(200, 'Saved', [
            'id' => $element->ID,
            'field' => $field,
            'value' => $value,
        ]);
    }

    private function jsonResponse(int $status, string $message, array $data = []): HTTPResponse
    {
        return HTTPResponse::create(json_encode(array_merge(['message' => $message], $data)), $status)
            ->addHeader('Content-Type', 'application/json');
    }
}
