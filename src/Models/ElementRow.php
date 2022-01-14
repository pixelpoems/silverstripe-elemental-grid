<?php

namespace TheWebmen\ElementalGrid\Models;

use DNADesign\Elemental\Models\BaseElement;
use SilverStripe\Forms\CheckboxField;
use SilverStripe\Forms\FieldGroup;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\TextField;
use TheWebmen\ElementalGrid\Controllers\ElementRowController;

/***
 * Class ElementRow
 * @package TheWebmen\ElementalGrid\Extensions
 *
 * @property BaseElement $owner
 */
class ElementRow extends BaseElement
{
    /**
     * @var string
     */
    private static $icon = 'font-icon-menu';

    /**
     * @var string
     */
    private static $table_name = 'ElementRow';

    /**
     * @var string
     */
    private static $singular_name = 'row';

    /**
     * @var string
     */
    private static $plural_name = 'rows';

    /**
     * @var string
     */
    private static $description = 'Row element';

    /**
     * @var string
     */
    private static $controller_class = ElementRowController::class;

    /**
     * @var array
     */
    private static $db = [
        'IsFluid' => 'Boolean',
        'CustomSectionClass' => 'Varchar(255)',
    ];

    /**
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->removeByName(['Column', 'TitleTag', 'ShowTitle', 'TitleClass']);

        $fields->renameField('ExtraClass', _t(__CLASS__ . '.CUSTOM_ROW_CLASSES', 'Custom row classes'));

        $fields->addFieldsToTab(
            'Root.Settings',
            [
                TextField::create('CustomSectionClass', _t(__CLASS__ . '.CUSTOM_SECTION_CLASSES','Custom section classes')),
            ]
        );

        if (!$fields->fieldPosition('FullWidth')) {
            $fields->addFieldsToTab(
                'Root.Main',
                [
                    CheckboxField::create('IsFluid', _t(__CLASS__ . '.IS_FLUID', 'The row uses the full width of the page')),
                ]
            );
        }
        
        $this->extend('updateElementalRowCMSFields', $fields);

        return $fields;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return _t(__CLASS__ . '.LABEL', 'Row');
    }

    /**
     * @return string
     */
    public function getRowClasses()
    {
        $classes = [];

        array_push($classes, $this->getCSSFramework()->getRowClasses());

        $this->extend('updateRowClasses', $classes);

        if ($this->owner->ExtraClass) {
            array_push($classes, $this->owner->ExtraClass);
        }

        return implode(' ', $classes);
    }


    /**
     * @return string
     */
    public function getSectionClasses()
    {
        $classes = [];

        $this->extend('updateSectionClasses', $classes);

        if ($this->owner->CustomSectionClass) {
            array_push($classes, $this->owner->CustomSectionClass);
        }

        return implode(' ', $classes);
    }

    /**
     * @return string
     */
    public function getContainerClasses()
    {
        $classes = [];

        array_push($classes, $this->getCSSFramework()->getContainerClass($this->IsFluid));

        $this->extend('updateContainerClasses', $classes);

        return implode(' ', $classes);
    }
}