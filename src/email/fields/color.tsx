import type { CustomField } from "@puckeditor/core";
import { ColorField } from "@/components/fields/ColorField";

export function colorField(label: string): CustomField<string> {
  return {
    type: "custom",
    label,
    render: (props) => <ColorField label={label} {...props} />,
  };
}
