# Elemental Grid Configuration

## Default settings
Use the following yaml configuration to override defaults;
```yaml
TheWebmen\ElementalGrid\ElementalConfig:
    default_viewport: 'MD'
    use_custom_title_classes: true
    css_framework: 'bulma'
```

## Add the extension
To use the Grid extension on the page you want in your project, copy the following code and paste it to your extensions.yml

```yaml
Page\That\Uses\Grid:
    extensions:
        - DNADesign\Elemental\Extensions\ElementalPageExtension
```

### Switching between ElementalArea and default Content per page
If you want to have the possibility to switch between a normal Content field or the ElementalArea, place the following extension on the page that also uses the grid:

```yaml
Page\That\Uses\Grid:
    extensions:
        - TheWebmen\ElementalGrid\Extensions\ElementalPageExtension
```

In your template, you can then use the following check to display the right content:

```silverstripe
<% if $UseElementalGrid && $ElementalArea %>
    $ElementalArea
<% else %>
    $Content
<% end_if %>
```

## Supported CSS frameworks
Currently Bulma and Bootstrap (5) are the supported CSS frameworks that can be combined with this module.


## Customizing the row, section and container CSS classes
There are 3 extension point you can use to update which row, section and container CSS classes will be rendered in the templates.

### Step 1. Extend the ElementRow
In your own project, extend the ElementRow that lives in this module
```yaml
TheWebmen\ElementalGrid\Models\ElementRow:
  extensions:
    - Your\ElementRow\Extension
```

### Step 2. Add the methods
Add these methods to your own ElementRow extension

```php
public function updateSectionClasses(&$classes)
{
    array_push($classes, 'add-your-own-css-class')
}

public function updateRowClasses(&$classes)
{
    array_push($classes, 'add-your-own-css-class')
}

public function updateContainerClasses(&$classes)
{
    array_push($classes, 'add-your-own-css-class')
}
```

## Override ElementRow template
Copy the file `templates/TheWebmen/ElementalGrid/Models/ElementRow.ss` to your own `themes/` folder. For example to:
`themes/default/TheWebmen/ElementalGrid/Models/ElementRow.ss`. You can then edit the template to make it fit your needs.